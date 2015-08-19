describe('Study Center', function() {
  it('should calculate distance between two points right', function() {
    var a = {lat:59.3293371, lng:13.4877472};
    var b = {lat:59.3293371, lng:13.4877472};
    expect(parseInt(calculateDistance(a, b))).toEqual(0);

    var a = {lat:59.3293371, lng:13.4877472};
    var b = {lat:59.3293262, lng:13.4877472};
    expect(parseInt(calculateDistance(a, b))).toEqual(1);

    var a = {lat:59.3293371, lng:13.4877472};
    var b = {lat:59.3293262, lng:13.4877162};
    expect(parseInt(calculateDistance(a, b))).toEqual(2);

    var a = {lat:59.3293371, lng:13.4877472};
    var b = {lat:59.3293371, lng:13.4819422};
    expect(parseInt(calculateDistance(a, b))).toEqual(329);

    var a = {lat:59.3293371, lng:13.4877472};
    var b = {lat:59.3225525, lng:13.4619422};
    expect(parseInt(calculateDistance(a, b))).toEqual(1646);
  });
});
