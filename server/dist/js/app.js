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
                xmlhttp.open("POST", "https://api.esendex.com/v1.0/messagedispatcher", false);
                xmlhttp.setRequestHeader("Authorization", "Basic c2lzQG1vcnNlYW5hbHl0aWNzLmNvbTpORFgyNDA4");
                var xml = '<messages>' +
                    '<accountreference>EX0051272</accountreference>' +
                    '<message>' +
                    '<to>' + number + '</to>' +
                    '<body>' + message + '</body>' +
                    '</message>' +
                    '</messages>';
                xmlhttp.send(xml);
                if (xmlhttp.status == 200) {
                    alert('success');
                } else {
                    alert("failure");
                }
            }
        }
    })

    .service('db', function ($rootScope, $state, $firebase, alert) {

        var ref = new Firebase('https://dhoxstamp.firebaseio.com/');
        var self = this;

        self.ref = ref;

        self.records = $firebase(ref.child('records')).$asObject();
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
                gender: 'M',
                age: 24,
                weight: 8000,
                height: 700,
                muac: 100,
                recorded_on: (new Date()).getTime(),
                recorded_by: 'Maria',
                location: 'K refugee camp',
                scheme: 1,
                lat: 0,
                long: 0,
                mother_weight: 50000,
                risk: 1,
                mobile: '07747828774'
            })
        }
        $scope.sendSMS = sms.send;
    })

    .directive('chart', function ($rootScope) {
        return {
            restrict: 'E',
            scope: {
                details: '='
            },
            template: '<svg class="chartHolder" style="min-width: 300px; width: 100%; height: 300px"></div>',
            link: function (scope, element, attrs) {

                function redraw() {
                    if (scope.details) {
                        //Create SVG element
                        var svg = d3.select(".chartHolder");
                        svg.selectAll('circle').remove();
                        svg.selectAll('g').remove();

                        var w = parseInt(svg.style('width').replace('px', ''));
                        var h = parseInt(svg.style('height').replace('px', ''));
                        var padding = 30;
                        var dataset = scope.details;
                        var regionColour = [d3.rgb(222, 235, 247),
                            d3.rgb(198, 219, 239),
                            d3.rgb(158, 202, 225),
                            d3.rgb(107, 174, 214),
                            d3.rgb(66, 146, 198),
                            d3.rgb(33, 113, 181),
                            d3.rgb(8, 81, 156),
                            d3.rgb(8, 48, 107),
                            d3.rgb(8, 30, 67)];
                        var typeSize = {
                            "Team 1": 5,
                            "Team 2": 5,
                            "Area Manager": 8
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
                }

                scope.$watch('details', redraw);
            }
        }
    })


;
