describe('Study Center', function() {
  it('should calculate distance between two points right', function() {
    var a = {lat:59.3293371, lng:13.4877472};
    var b = {lat:59.3293371, lng:13.4877472};
    expect(calculateDistance(a, b)).toEqual(0);

    var a = {lat:59.3293371, lng:13.4877472};
    var b = {lat:59.3293389, lng:13.4877472};
    expect(calculateDistance(a, b)).toBeCloseTo(0.2, 1);

    var a = {lat:59.3293371, lng:13.4877472};
    var b = {lat:59.3293262, lng:13.4877472};
    expect(calculateDistance(a, b)).toBeCloseTo(1.2, 1);

    var a = {lat:59.3293371, lng:13.4877472};
    var b = {lat:59.3293262, lng:13.4877162};
    expect(calculateDistance(a, b)).toBeCloseTo(2.1, 1);

    var a = {lat:59.3293371, lng:13.4877472};
    var b = {lat:59.3293371, lng:13.4819422};
    expect(calculateDistance(a, b)).toBeCloseTo(329, 0);

    var a = {lat:59.3293371, lng:13.4877472};
    var b = {lat:59.3225525, lng:13.4619422};
    expect(calculateDistance(a, b)).toBeCloseTo(1647, 0);
  });
});
