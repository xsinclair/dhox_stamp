describe("Unit testing of RTM module", function() {
    beforeEach(module('rtm'));

    describe('Values', function() {
        it('should return a valid URL', function() {
            inject(function(fbUrl) {
                expect(fbUrl).toBe('https://rtm.firebaseio.com/');
            });
        });
    });

    describe('Marker factory', function() {
        var marker;
        beforeEach(inject(function(_marker_) {
            marker = _marker_;
        }));

        it('should return a pointWords object', function() {
            expect(marker.pointWords).toBeDefined();
            expect(marker.pointWords.love).toBe('Love');
        });

        it('should return a chases array', function() {
            expect(marker.chases).toBeDefined();
            expect(marker.chases.length).toBe(62);
        });

        it('should return a handicaps array', function() {
            expect(marker.handicaps).toBeDefined();
            expect(marker.handicaps.length).toBe(8);
        });

        it('should return a handicapDifferences array', function() {
            expect(marker.handicapDifferences).toBeDefined();
            expect(marker.handicapDifferences.length).toBe(7);
        });

        it('should return a chase by id', function() {
            var chase = marker.chaseById('three');
            expect(chase.name).toBe('3 yards');
        });
    });

    var $controller;
    beforeEach(inject(function(_$controller_) {
        $controller = _$controller_;
    }));

    describe('Body controller', function() {
        it('should return an object for rtmRef', function() {
            var scope = {},
            ctrl = $controller('bodyCtrl', { $scope: scope });
            expect(scope.rtmRef).toBeDefined();
        });
    });
});
