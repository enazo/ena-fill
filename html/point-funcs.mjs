
// 获取两个点的中点
export function getMiddlePoint(prevPoint, nextPoint) {
	return {
		x: (prevPoint.x + nextPoint.x) / 2,
		y: (prevPoint.y + nextPoint.y) / 2
	};
}

// 获取两个点的中点角度
export function getMiddlePointAngleRight(prevPoint, nextPoint) {
	const middlePoint = getMiddlePoint(prevPoint, nextPoint);
	// nextPoint 是前进方向，我需要确保获取到前进方向的右侧角度
	const angle = Math.atan2(nextPoint.y - middlePoint.y, nextPoint.x - middlePoint.x);
	console.log(angle);
	return angle + Math.PI / 2;
}

export function getMiddlePointAngleLeft(prevPoint, nextPoint) {
	const middlePoint = getMiddlePoint(prevPoint, nextPoint);
	// nextPoint 是前进方向，我需要确保获取到前进方向的左侧角度
	const angle = Math.atan2(middlePoint.y - nextPoint.y, middlePoint.x - nextPoint.x);
	return angle - Math.PI / 2;
}