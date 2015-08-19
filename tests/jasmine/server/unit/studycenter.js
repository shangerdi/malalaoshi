describe('Study Center', function() {
  it('should calculate distance between two points right', function() {
    var a = {lat:59.3293371, lng:13.4877472};
    var b = {lat:59.3225525, lng:13.4619422};
    expect(parseInt(calculateDistance(a, b)/10)).toEqual(164);

    var a = {lat:59.3293371, lng:13.4877472};
    var b = {lat:59.3245525, lng:13.4619422};
    expect(parseInt(calculateDistance(a, b)/10)).toEqual(155);

    var a = {lat:59.3293371, lng:13.4877472};
    var b = {lat:59.3293371, lng:13.4819422};
    expect(parseInt(calculateDistance(a, b)/10)).toEqual(32);

    var a = {lat:59.3293371, lng:13.4877472};
    var b = {lat:59.3293371, lng:13.4877472};
    expect(parseInt(calculateDistance(a, b))).toEqual(0);

    var a = {lat:59.3293371, lng:13.4877472};
    var b = {lat:59.3293372, lng:13.4877472};
    expect(parseInt(calculateDistance(a, b))).toEqual(0);
  });
});
