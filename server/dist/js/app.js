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
                console.log('Sending to ' + number + ', message: ' + message);
                xmlhttp.open("POST", "http://81.149.72.79:3001/sendText", true);
                xmlhttp.send(data);
            }
        }
    })

    .service('db', function ($rootScope, $state, $firebase, sms) {

        var ref = new Firebase('https://dhoxstamp.firebaseio.com/');
        var self = this;

        self.ref = ref;

        self.records = $firebase(ref.child('records')).$asArray();
        self.records.$watch(function(e) {
            if(e.event=='child_added') {
                var recordRef = ref.child('records/' + e.key);
                recordRef.on('value', function(snapshot) {
                    var data = snapshot.val();
                    if(data.mobile && data.risk) {
                        var message;
                        switch(data.risk) {
                            case 1:
                                message = "Your child is eating well. Well done, but please make sure to attend checking regularly. Come back sooner if food situation changes or child develops high fever.";
                                break;
                            case 2:
                                message = "Your child may not be eating enough food and is at risk of health complications. Please ask your nurse for dietary advice and come back for checking in 1 week.";
                                break;
                            case 3:
                                message = "Your child has signs of severe acute malnutrition and their life is in danger. Please take them to hospital immediately. The treatment will be free of cost.";
                                break;
                        }
                        sms.send(data.mobile, message);
                        recordRef.update({mobile: '', sent: true}); // To make sure we don't send multiple times
                    }
                });
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
        $scope.sendSMS = sms.send;
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

    .directive('pie', function () {
        return {
            restrict: 'E',
            scope: {
                details: '='
            },
            template: '<svg class="pieHolder" style="width: 100%; height: 200px"></div>',
            link: function (scope, element, attrs) {
                scope.details.$watch(function() {
                    redraw()
                });
                function redraw() {
                    var svg = d3.select(".pieHolder");
                    var w = parseInt(svg.style('width').replace('px', ''));
                    var h = parseInt(svg.style('height').replace('px', ''));
                    var padding = 30;
                    var regionColour = [d3.rgb(128, 135, 46),
                        d3.rgb(255, 97, 56),
                        d3.rgb(185, 18, 27)];
                    var risk = ['Low risk', 'Medium risk', 'High risk'];
                    var dataset = {m:[0,0,0,0], f:[0,0,0,0]}, mTotal=0, fTotal=0;
                    angular.forEach(scope.details, function(record) {
                        if(record.gender) {
                            var thisSet = dataset[record.gender];
                            if(thisSet) {
                                thisSet[record.risk] = thisSet[record.risk]+1;
                                if(record.gender=='m') {
                                    mTotal = mTotal + 1;
                                } else {
                                    fTotal = fTotal + 1;
                                }
                            }
                        }
                    });


                    var myScale = d3.scale.linear().domain([0, mTotal]).range([0, 2 * Math.PI]);
                    var arc = d3.svg.arc()
                                .innerRadius(50)
                                .outerRadius(100)
                                .startAngle(myScale(0))
                                .endAngle(myScale(75));

                    var cScale = d3.scale.linear().domain([0, 100]).range([0, 2 * Math.PI]);

                    data = [[0,50,"#AA8888"], [50,75,"#88BB88"], [75,100,"#8888CC"]]

                    var arc = d3.svg.arc()
                                .innerRadius(50)
                                .outerRadius(100)
                                .startAngle(function(d){return cScale(d[0]);}) .endAngle(function(d){return cScale(d[1]);});

                    svg.selectAll("path")
                        .data(data)
                        .enter()
                        .append("path")
                        .attr("d", arc)
                        .style("fill", function(d){return d[2];})
                        .attr("transform", "translate(" + w/2 + "," + h/2 + ")");


                        /*
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
                            */
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

