import { logs } from "./logs.mjs";


import { simplify } from "../simplify2.mjs";

const width = 640;
const height = 480;

const devicePixelRatio = 4;



// 初始增生力
const stepAngleExpansion = 24;
const stepAngle = Math.PI / stepAngleExpansion;
const fertility = 8;

const stepSize = 0.2;

// 新增点
const newPointFertility = 20;

// 新增点扩张力
const newPointExpansionForce = 200;

// 扩张力距离系数
const expansionForceDistance = 2;

// 最小扩张距离
const minExpansionDistance = 0.2;



const canvas = document.createElement("canvas");
canvas.width = width * devicePixelRatio;
canvas.height = height * devicePixelRatio;

document.body.appendChild(canvas);

canvas.style.position = "absolute";

const ctx = canvas.getContext("2d");

ctx.transform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);


ctx.strokeStyle = "black";
ctx.lineWidth = 4;

// 圆角
ctx.lineJoin = "round";
ctx.lineCap = "round";



const fillCanvas = document.createElement("canvas");
fillCanvas.width = width * devicePixelRatio;
fillCanvas.height = height * devicePixelRatio;
document.body.appendChild(fillCanvas);

fillCanvas.style.pointerEvents = "none";
fillCanvas.style.position = "relative";
fillCanvas.style.zIndex = 2;

const fillCtx = fillCanvas.getContext("2d");

fillCtx.transform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);

fillCtx.fillStyle = 'red';
fillCtx.strokeStyle = 'red';
fillCtx.strokeWidth = 6;

fillCtx.lineJoin = "round";
fillCtx.lineCap = "round";

fillCtx.globalAlpha = 0.5;

fillCtx.font = '3px sans-serif';
// 画在背后
fillCtx.globalCompositeOperation = "destination-over";

const drawRed = (x, y, color = 'red') => {
	// fillCtx.fillStyle = color;
	// fillCtx.fillRect(x, y, 1, 1);
}



const drawAngle = (x, y, angle, distance = 4) => {
	fillCtx.save();
	fillCtx.strokeStyle = 'blue';
	fillCtx.beginPath();
	fillCtx.moveTo(x, y);
	fillCtx.lineTo(x + distance * Math.cos(angle), y + distance * Math.sin(angle));
	fillCtx.stroke();
	fillCtx.restore();
}

const drawLine00 = (log) => {
	const [type, line] = log;
	const [ lineType, ...points] = line;

	if(type === "line") {
		ctx.save();
		ctx.beginPath();
		ctx.moveTo(points[0], points[1]);
		for(let i = 2; i < points.length; i+=2) {
			ctx.lineTo(points[i], points[i + 1]);
		}
		ctx.stroke();
		ctx.restore();
	}
}
for(let log of logs) {
	drawLine00(log);
}

let startX = 0;
let startY = 0;
let filling = false;
canvas.addEventListener("pointerdown", (e) => {
	const rect = canvas.getBoundingClientRect();
	const x = ( e.clientX - rect.left ) / devicePixelRatio;
	const y = ( e.clientY - rect.top ) / devicePixelRatio;
	startX = x;
	startY = y;

	filling = true;
});

const simplifiedPointsToPath = (simplifiedPoints) => {
	let pathText = `M${simplifiedPoints[0]},${simplifiedPoints[1]}`;
	for(let i = 2; i < simplifiedPoints.length; i+=2) {
		pathText += `L${simplifiedPoints[i]},${simplifiedPoints[i+1]}`;
	}
	return pathText;
}

let path = [];
document.addEventListener("pointerup", (e) => {
	filling = false;
	console.log(path);

	const points = [];
	for(let point of path) {
		points.push(point[0], point[1]);
	}
	let simplifiedPoints = simplify(points, 0.3, false);
	simplifiedPoints = simplifiedPoints.map(v=>Math.round(v * 100) / 100);

	console.log(points);
	console.log(simplifiedPoints);

	fillCtx.save();
	fillCtx.globalCompositeOperation = "destination-over";
	fillCtx.globalAlpha = 1;
	
	fillCtx.clearRect(0, 0, width, height);

	fillCtx.fillStyle = 'red';

	fillCtx.strokeStyle = 'orange';
	fillCtx.strokeWidth = 1;
	fillCtx.lineWidth = 2;
	fillCtx.beginPath();
	fillCtx.moveTo(simplifiedPoints[0], simplifiedPoints[1]);
	for(let i = 2; i < simplifiedPoints.length; i+=2) {
		fillCtx.lineTo(simplifiedPoints[i], simplifiedPoints[i + 1]);
	}
	// fillCtx.stroke();
	fillCtx.fill();
	fillCtx.restore();

	const pathText = simplifiedPointsToPath(simplifiedPoints);
	const path2D = new Path2D(pathText);
	fillCtx.stroke(path2D);
});

document.addEventListener("pointermove", (e) => {
	if(!filling) {
		return;
	}

	const rect = canvas.getBoundingClientRect();
	const nowX = ( e.clientX - rect.left ) / devicePixelRatio;
	const nowY = ( e.clientY - rect.top ) / devicePixelRatio;
	const x = startX;
	const y = startY;

	console.log(x, y);

	const distance = calcDistance(x, y, nowX, nowY);


	drawRed(x, y);
	// ctx.save();
	// ctx.fillStyle = "red";
	// ctx.fillRect(
	// 	x - 2,
	// 	y - 2,
	// 	4,
	// 	4
	// );
	// ctx.restore();

	const pixel = ctx.getImageData(x, y, 1, 1);
	console.log(pixel);

	const alpha = pixel.data[3];
	console.log(alpha);

	findFillPath(x, y, distance);
})

    // 检查点是否在画布范围内
const isInBounds = (x, y) => {
	return x >= 0 && x < width && y >= 0 && y < height;
};

// 检查点是否是边界(alpha > 128)
const isBoundary = (x, y) => {
	const pixel = ctx.getImageData( x * devicePixelRatio, y * devicePixelRatio, 1, 1);
	return pixel.data[3] > 128;
};

const calcDistance = (x1, y1, x2, y2) => {
	return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}


import { getMiddlePoint, getMiddlePointAngleLeft, getMiddlePointAngleRight } from "./point-funcs.mjs";
const findFillPath = (x, y, distance) => {
	if(isBoundary(x, y)) {
		return;
	}

    fillCtx.clearRect(0, 0, width, height);
    
    const points = [];
    
    
    let iterations = 0;
    const maxIterations = distance * 6;
	const expansionForce = distance / expansionForceDistance;
    
    // 初始化点,从中心点开始向四周扩散
    for(let angle = 0; angle < Math.PI * 2; angle += stepAngle) {
		const point = {
			x: x + Math.cos(angle) * stepSize,
            y: y + Math.sin(angle) * stepSize,
            angle,
            expansionForce,
			fertility,
			color: 'red',
        };

		drawRed(point.x, point.y, point.color);

		points.push(point);
    }
    
	let stopPointIndexs = [];
    while(iterations < maxIterations) {
        let allStopped = true;

		let allPointAndIndexs = [];
        

		// 新增的前进点前进方向总是不对 todo
		for(let pointIndex = 0; pointIndex < points.length; pointIndex++) {
			const prevPointIndex = (pointIndex - 1 + points.length) % points.length;
			const nextPointIndex = (pointIndex + 1) % points.length;

			const point = points[pointIndex];
			const prevPoint = points[prevPointIndex];
			const nextPoint = points[nextPointIndex];


			// 上一轮被停止的点
			if( stopPointIndexs.includes(pointIndex) ) {
				if(nextPoint.expansionForce > 0 || stopPointIndexs.includes(nextPointIndex) ) {

					
					const point = points[pointIndex];
					const nextPoint = points[nextPointIndex];

					const distance = calcDistance(point.x, point.y, nextPoint.x, nextPoint.y);

					if(distance > minExpansionDistance) {
						const middlePoint = getMiddlePoint(point, nextPoint);
	
						middlePoint.color = 'blue';
	
						middlePoint.angle = getMiddlePointAngleRight(nextPoint,point);
	
						drawAngle(middlePoint.x, middlePoint.y, middlePoint.angle, 10);
	
	
						middlePoint.fertility = newPointFertility;
						middlePoint.expansionForce = newPointExpansionForce;
						allPointAndIndexs.push({
							point: middlePoint,
							pointIndex: nextPointIndex,
						});
					}
				}
				if(prevPoint.expansionForce > 0) {
					const point = points[pointIndex];
					const prevPoint = points[prevPointIndex];
						
					const middlePoint = getMiddlePoint(point, prevPoint);

					middlePoint.color = 'blue';

					middlePoint.angle = getMiddlePointAngleRight(point, prevPoint);

					drawAngle(middlePoint.x, middlePoint.y, middlePoint.angle, 10);

					middlePoint.fertility = newPointFertility;
					middlePoint.expansionForce = newPointExpansionForce;
					allPointAndIndexs.push({
						point: middlePoint,
						pointIndex: pointIndex,
					});
				}
			}

		}

		stopPointIndexs = [];
		
		allPointAndIndexs = allPointAndIndexs.sort((a, b) => {
			return b.pointIndex - a.pointIndex;
		});

		console.log('allPointAndIndexs', allPointAndIndexs);

		for(let allPointAndIndexsIndex = 0; allPointAndIndexsIndex < allPointAndIndexs.length; allPointAndIndexsIndex++) {

			const { point, pointIndex } = allPointAndIndexs[allPointAndIndexsIndex];
			points.splice(pointIndex, 0, point);
		}

        // 更新每个点的位置
        for(let pointIndex = 0; pointIndex < points.length; pointIndex++) {
            const point = points[pointIndex];


            // 计算下一个位置
            const nextX = point.x + Math.cos(point.angle) * stepSize;
            const nextY = point.y + Math.sin(point.angle) * stepSize;


			// fillCtx.fillStyle = 'green';
			// fillCtx.textAlign = 'left';
			// fillCtx.fillText(Math.ceil(point.angle * (180/Math.PI)), point.x, point.y);

			// fillCtx.fillStyle = 'blue';
			// fillCtx.textAlign = 'right';
			// fillCtx.fillText(pointIndex, point.x, point.y);

			fillCtx.fillStyle = 'red';
            // 如果扩张力为0则跳过
            if(point.expansionForce <= 0) {
                // 减少相邻点的扩张力
                const prevIndex = (pointIndex - 1 + points.length) % points.length;
                const nextIndex = (pointIndex + 1) % points.length;
                points[prevIndex].expansionForce = Math.max(0, points[prevIndex].expansionForce - 1);
                points[nextIndex].expansionForce = Math.max(0, points[nextIndex].expansionForce - 1);

                continue;
            }
            
            
            // 检查是否碰到边界
            if(!isInBounds(nextX, nextY) || isBoundary(nextX, nextY)) {

				if(point.expansionForce > 0) {
					stopPointIndexs.push(pointIndex);
				}

                // 碰到边界时:
                point.expansionForce = 0; // 清零当前点的扩张力

				point.fertility = 0;
				
				// point.x = nextX;
				// point.y = nextY;
                continue;
            }
            
            drawRed(nextX, nextY);
            point.x = nextX;
            point.y = nextY;
            allStopped = false;
        }
        
        if(allStopped) break;
        iterations++;
    }
    
    // 构建最终路径
    path = [];
    for(let point of points) {
        path.push([point.x, point.y]);
    }
    
    // 在fillCanvas上绘制填充路径
    fillCtx.beginPath();
    fillCtx.moveTo(path[0][0], path[0][1]);
    for(let i = 1; i < path.length; i++) {
        fillCtx.lineTo(path[i][0], path[i][1]);
        drawRed(path[i][0], path[i][1]);
    }
    fillCtx.closePath();
    fillCtx.fill();
	fillCtx.stroke();
    
    return path;
}




