angular.module('dhoxstamp', ['ui.bootstrap', 'ui.router', 'ngTouch', 'ngAnimate', 'firebase'])
    .config(function ($stateProvider, $urlRouterProvider) {
        /* Configuation */

        $stateProvider
            .state("home", {
                url: '/',
                controller: "homeCtrl",
                templateUrl: "views/home.html",
                resolve: {
                    currentUser: function(authentication) {
                        return authentication.currentUser();
                    }
                }
            })
            .state("login", {
                url: '/login',
                templateUrl: 'views/login.html',
                controller: 'loginCtrl'
            });

        $urlRouterProvider.otherwise('/');
    })

    .factory('alert', function ($rootScope, $timeout) {
        //Deals with the alert messages
        $rootScope.alerts = [];

        var alertFn = function (type, msg) {
            $rootScope.alerts.unshift({type: type, msg: msg});
            $timeout(function () {
                $rootScope.alerts.pop();
            }, 5000);
        };
        return {
            close: function (index) {
                $rootScope.alerts.splice(index, 1);
            },
            show: alertFn,
            error: function (error) {
                alertFn('danger', JSON.stringify(error));
            }
        };
    })

    .factory('authentication', function ($q, $rootScope, $firebase, $firebaseSimpleLogin) {
        var ref = new Firebase("https://dhoxstamp.firebaseio.com/");
        var fbRef =$firebaseSimpleLogin(ref);
        function getCurrentUser() {
            return fbRef.$getCurrentUser();
        }

        return {
            login: function(email, password) {
                var deferred = $q.defer();

                fbRef.$login('password', {
                    email: email,
                    password: password
                }).then(function() {
                    getCurrentUser().then(deferred.resolve, deferred.reject);
                }, deferred.reject);

                return deferred.promise;
            },
            logout: function() {
                fbRef.$logout();
                delete $rootScope.user;
            },
            currentUser: getCurrentUser
        }
    })

    .factory('sms', function() {
        return {
            send: function(number, message) {
                var xmlhttp = new window.XMLHttpRequest;
                var data = new FormData();
                data.append('number', number);
                data.append('message', message);
                xmlhttp.open("POST", "http://81.149.72.79:3001/sendText", true);
                xmlhttp.send(data);
            }
        }
    })

    .service('db', function ($rootScope, $state, $firebase, alert) {

        var ref = new Firebase('https://dhoxstamp.firebaseio.com/');
        var self = this;

        self.ref = ref;

        self.records = $firebase(ref.child('records')).$asArray();
        self.records.$watch(function(e) {
            if(e.event=='child_added') {
                console.log(e.key);
            }
        });
        self.newRecord = function(record) {
            $firebase(ref.child("records")).$push(record);
        }
    })

    .filter('reverse', function () {
        function toArray(list) {
            var k, out = [];
            if (list) {
                if (angular.isArray(list)) {
                    out = list;
                }
                else if (typeof(list) === 'object') {
                    for (k in list) {
                        if (list.hasOwnProperty(k)) {
                            out.push(list[k]);
                        }
                    }
                }
            }
            return out;
        }

        return function (items) {
            return toArray(items).slice().reverse();
        };
    })

    .controller('bodyCtrl', function ($scope, alert, $state, authentication) {
        $scope.logout = function() {
            authentication.logout();
            $state.go("home");
        }
        $scope.closeAlert = alert.close;
    })

    .controller('loginCtrl', function ($scope, $state, alert, authentication) {
        $scope.loginEmail = '';
        $scope.loginPassword = '';
        $scope.userLogin = function () {
            authentication.login($scope.loginEmail,$scope.loginPassword).then(function (user) {
                $state.go('home');
            }, function (error) {
                alert.error("Unrecognised user and/or password");
                $scope.loginPassword = '';
            });
        };
    })

    .controller('homeCtrl', function ($rootScope, $scope, db, sms) {
        $scope.records = db.records;
        $scope.newRecord = function() {
            db.newRecord({
                gender: Math.random() < 0.5 ? 'M' : 'F',
                age: Math.floor((Math.random() * 36) + 1),
                weight: 8000 + Math.floor((Math.random() * 4000) + 1)- Math.floor((Math.random() * 4000) + 1),
                height: 700 + Math.floor((Math.random() * 300) + 1)- Math.floor((Math.random() * 300) + 1),
                muac: 110 + Math.floor((Math.random() * 20) + 1)- Math.floor((Math.random() * 20) + 1),
                recorded_on: (new Date()).getTime(),
                recorded_by: 'Maria',
                location: 'K refugee camp',
                scheme: 1,
                latitude: 51.7530466 + Math.random() - Math.random(),
                longitude: -1.2674058 + Math.random() - Math.random(),
                risk: (Math.random() < 0.333 ? 1 : (Math.random() <0.5 ? 2 : 3)) ,
                mobile: ''
            })
        };
        $scope.riskDescription = {1: 'Low', 2: 'Medium', 3: 'High'};
        $scope.sendSMS = sms.send;
        $scope.moment = moment;
    })

    .directive('chart', function ($rootScope) {
        return {
            restrict: 'E',
            scope: {
                details: '='
            },
            template: '<svg class="chartHolder" style="min-width: 300px; width: 100%; height: 450px"></div>',
            link: function (scope, element, attrs) {
                /*
                scope.details.$watch(function() {
                    redraw()
                });
                function redraw() {
                        var layers = [{name: 'Low', values: []}, {name: 'Medium', values: []},{name: 'High', values:[]}], minX, maxX;
                        angular.forEach(scope.details, function(record) {
                            if(record.risk) {
                                var thisDate = moment(record.recorded_on).startOf('minute');
                                var xValue = thisDate.unix();
                                minX = (minX ? (xValue < minX ? xValue : minX) : xValue);
                                maxX = (maxX ? (xValue > maxX ? xValue : maxX) : xValue);
                                var thisLayer = layers[record.risk-1];
                                var found = false;
                                angular.forEach(thisLayer.values, function(value) {
                                    if(value.x==xValue) {
                                        value.y = value.y + 1;
                                        found = true;
                                    }
                                });
                                if(!found) thisLayer.values.push({x: xValue, y:1});
                            }
                        });
                        var svg = d3.select(".chartHolder");
                        svg.selectAll('circle').remove();
                        svg.selectAll('g').remove();

                        var w = parseInt(svg.style('width').replace('px', ''));
                        var h = parseInt(svg.style('height').replace('px', ''));
                        var padding = 30;
                        var regionColour = [d3.rgb(222, 235, 247),
                            d3.rgb(198, 219, 239),
                            d3.rgb(158, 202, 225)];
                        var typeSize = {
                            "Low risk": 5,
                            "Medium risk": 5,
                            "High risk": 8
                        }

                        var xScale = d3.scale.linear()
                            .domain([0, d3.max(dataset, function (d) {
                                return d.svt;
                            })])
                            .range([padding, w - padding * 2]);

                        var yScale = d3.scale.linear()
                            .domain([0,9])
                            .range([h - padding, padding]);

                        //Define X axis
                        var xAxis = d3.svg.axis()
                            .scale(xScale)
                            .orient("bottom")
                            .ticks(5);

                        //Define Y axis
                        var yAxis = d3.svg.axis()
                            .scale(yScale)
                            .orient("left")
                            .ticks(8);

                        //Create X axis
                        svg.append("g")
                            .attr("class", "axis")
                            .attr("transform", "translate(0," + (h - padding) + ")")
                            .call(xAxis);

                        //Create Y axis
                        svg.append("g")
                            .attr("class", "axis")
                            .attr("transform", "translate(" + padding + ",0)")
                            .call(yAxis);


                        //Create circles
                        svg.selectAll("circle")
                            .data(dataset)
                            .enter().append("circle")
                            .attr("cx", function (d) {
                                return xScale(d.svt);
                            })
                            .attr("cy", function (d) {
                                return yScale(d.region);
                            })
                            .attr("r", function (d) {
                                return typeSize[d.type];
                            })
                            .style('fill', function (d) {
                                return regionColour[d.region - 1];
                            });
                }
                */
            }
        }
    })
;

