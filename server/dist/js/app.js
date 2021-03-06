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

    .service('db', function ($rootScope, $state, $firebase) {

        var ref = new Firebase('https://dhoxstamp.firebaseio.com/');
        var self = this;

        self.ref = ref;

        self.records = $firebase(ref.child('records')).$asArray();
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

    .controller('homeCtrl', function ($rootScope, $scope, db) {
        $scope.records = db.records;
        $scope.newRecord = function() {
            db.newRecord({
                gender: Math.random() < 0.5 ? 'm' : 'f',
                age: Math.floor((Math.random() * 36) + 1),
                weight: 8000 + Math.floor((Math.random() * 4000) + 1)- Math.floor((Math.random() * 4000) + 1),
                height: 700 + Math.floor((Math.random() * 300) + 1)- Math.floor((Math.random() * 300) + 1),
                muac: 110 + Math.floor((Math.random() * 20) + 1)- Math.floor((Math.random() * 20) + 1),
                recorded_on: (new Date()).getTime(),
                recorded_by: 'Maria',
                location: 'K refugee camp',
                scheme: 1,
                latitude: 51.7530466 + Math.random()/1000 - Math.random()/1000,
                longitude: -1.2674058 + Math.random()/1000 - Math.random()/1000,
                risk: (Math.random() < 0.333 ? 1 : (Math.random() <0.5 ? 2 : 3)) ,
                mobile: $scope.mobile || ''
            })
        };
        $scope.riskDescription = {1: 'Low', 2: 'Medium', 3: 'High'};
        $scope.moment = moment;
    })

    .directive('chart', function () {
        return {
            restrict: 'E',
            scope: {
                details: '='
            },
            template: '<svg class="chartHolder" style="min-width: 300px; width: 100%; height: 250px"></div>',
            link: function (scope, element, attrs) {
                scope.details.$watch(function() {
                    redraw()
                });
                function redraw() {
                        var svg = d3.select(".chartHolder");
                        svg.selectAll('circle').remove();
                        svg.selectAll('g').remove();

                        var w = parseInt(svg.style('width').replace('px', ''));
                        var h = parseInt(svg.style('height').replace('px', ''));
                        var padding = 30;
                        var regionColour = [d3.rgb(128, 135, 46),
                            d3.rgb(255, 97, 56),
                            d3.rgb(185, 18, 27)];
                        var risk = ['Low risk', 'Medium risk', 'High risk'];
                        var dataset = scope.details;
                        var xScale = d3.scale.linear()
                            .domain([d3.min(dataset, function (d) {
                                return d.recorded_on;
                            }), d3.max(dataset, function (d) {
                                return d.recorded_on;
                            })])
                            .range([padding, w - padding * 2]);

                        var yScale = d3.scale.linear()
                            .domain([0,3])
                            .range([h - padding, padding]);

                        //Define X axis
                        var xAxis = d3.svg.axis()
                            .scale(xScale)
                            .orient("bottom")
                            .ticks(5)
                            .tickFormat(function(d) { return moment(d).format('HH:mm');});

                        //Define Y axis
                        var yAxis = d3.svg.axis()
                            .scale(yScale)
                            .orient("right")
                            .ticks(3)
                            .tickFormat(function(d) {
                                return risk[d-1];
                            });

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
                                return xScale(d.recorded_on);
                            })
                            .attr("cy", function (d) {
                                return yScale(d.risk);
                            })
                            .attr("r", function (d) {
                                return 20;
                            })
                            .style('fill', function (d) {
                                return regionColour[d.risk - 1];
                            })
                            .style('opacity', 0.15);
                }
            }
        }
    })

    .directive('map', function (db) {
        return {
            restrict: 'E',
            scope: {
                details: '='
            },
            template: '<div id="map" style="min-width: 300px; width: 100%; height: 300px"></div>',
            link: function (scope, element, attrs) {
                var riskColour = ['#7D8A2E',
                    '#FF6138',
                    '#B9121B'];
                L.mapbox.accessToken = 'pk.eyJ1IjoibWFydGlubW9yc2UiLCJhIjoiWklQb1Y2YyJ9.YywRWnY2QcLnslcjcmeQ_g';
                var map = L.mapbox.map('map', 'martinmorse.k85ca0a1')
                    .setView([51.7530466, -1.2674058], 17);
                scope.details.$watch(function(e) {
                    if(e.event=='child_added') {
                        var recordRef = db.ref.child('records/' + e.key);
                        recordRef.on('value', function(snapshot) {
                            var data =snapshot.val();
                            if(data.latitude && data.longitude) {
                                L.circleMarker([data.latitude, data.longitude], {
                                    fillOpacity: 0.35,
                                    radius: 15,
                                    weight: 0,
                                    color: riskColour[data.risk-1]
                                }).addTo(map);
                            }
                        });
                    }
                    //redraw()
                });
                function redraw() {
                    angular.forEach(scope.details, function(record) {
                        if(record.latitude && record.longitude) {
                        }
                    });
                }
            }
        }
    })
;

