/*
 (c) 2017, Vladimir Agafonkin
 Simplify.js, a high-performance JS polyline simplification library
 mourner.github.io/simplify-js
*/


export const simplify = (()=> {
	const getSqDist = (p1x,p1y, p2x,p2y)=>{

		var dx = p1x - p2x,
			dy = p1y - p2y;

		return dx * dx + dy * dy;
	}
	const getSqSegDist = (p0x,p0y, p1x,p1y, p2x,p2y)=> {

		var x = p1x,
			y = p1y,
			dx = p2x - x,
			dy = p2y - y;

		if (dx !== 0 || dy !== 0) {

			var t = ((p0x - x) * dx + (p0y - y) * dy) / (dx * dx + dy * dy);

			if (t > 1) {
				x = p2x;
				y = p2y;

			} else if (t > 0) {
				x += dx * t;
				y += dy * t;
			}
		}

		dx = p0x - x;
		dy = p0y - y;

		return dx * dx + dy * dy;
	}
	const simplifyRadialDist = (points, sqTolerance)=>{

		var prevPointX = points[0],prevPointY = points[1],
			newPoints = [prevPointX,prevPointY],
			pointX,pointY;

		for (var i = 2, len = points.length; i < len; i+=2) {
			pointX = points[i];
			pointY = points[i + 1];

			if (getSqDist(pointX,pointY, prevPointX,prevPointY) > sqTolerance) {
				newPoints.push(pointX);
				newPoints.push(pointY);
				prevPointX = pointX;
				prevPointY = pointY;
			}
		}

		if (prevPointX !== pointX && prevPointY !== pointY){
			newPoints.push(pointX);
			newPoints.push(pointY);
		}

		return newPoints;
	}

	const simplifyDPStep = (points, first, last, sqTolerance, simplified)=>{
		var maxSqDist = sqTolerance,
			index;

		for (var i = first + 2; i < last; i += 2) {
			var sqDist = getSqSegDist(
				points[i],points[i+1],
				points[first],points[first+1],
				points[last],points[last+1]
			);

			if (sqDist > maxSqDist) {
				index = i;
				maxSqDist = sqDist;
			}
		}

		if (maxSqDist > sqTolerance) {
			if (index - first > 1) simplifyDPStep(points, first, index, sqTolerance, simplified);
			simplified.push(points[index]);
			simplified.push(points[index + 1]);
			if (last - index > 1) simplifyDPStep(points, index, last, sqTolerance, simplified);
		}
	}

// simplification using Ramer-Douglas-Peucker algorithm
	const simplifyDouglasPeucker = (points, sqTolerance)=> {
		var last = points.length - 2;

		var simplified = [points[0],points[1]];
		simplifyDPStep(points, 0, last, sqTolerance, simplified);
		simplified.push(points[last]);
		simplified.push(points[last + 1]);

		return simplified;
	}

// both algorithms combined for awesome performance
	return (points, tolerance, highestQuality)=>{

		if (points.length <= 4) return points;

		var sqTolerance = tolerance !== undefined ? tolerance * tolerance : 1;

		points = highestQuality ? points : simplifyRadialDist(points, sqTolerance);
		points = simplifyDouglasPeucker(points, sqTolerance);

		return points;
	}

})();