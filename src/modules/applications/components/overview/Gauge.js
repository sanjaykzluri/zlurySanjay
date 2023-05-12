import { height } from 'dom-helpers';
import React, {
    useEffect,
    useState,
    forwardRef,
    useImperativeHandle,
    useRef
  } from 'react';
  
  
  const convertToRadian = (x) => {
    return (x * Math.PI) / 180;
  };
  const drawArcSvg = (
    centerPoint,
    radius,
    nPoints,
    startAngle,
    endAngle
  ) => {
    let step = (endAngle - startAngle) / nPoints;
    let firstX = -radius * Math.cos(convertToRadian(startAngle)) + centerPoint.x;
    let fristY = -radius * Math.sin(convertToRadian(startAngle)) + centerPoint.y;
    let path = "M" + firstX.toString() + " " + fristY.toString() + " ";
    for (let theta = startAngle + step; theta <= endAngle; theta += step) {
      let x = -radius * Math.cos(convertToRadian(theta)) + centerPoint.x;
      let y = -radius * Math.sin(convertToRadian(theta)) + centerPoint.y;
      path += "L" + x + " " + y + " ";
    }
    return path;
  };
  
  const GaugeChart = forwardRef(({width, ...props}, ref) => {
    const mainDiv = useRef(null);
  
    const [pathBack, setPathBack] = useState("");
    const [pathFront, setPathFront] = useState("");
    const [textX, setTextX] = useState("");
    const [textY, setTextY] = useState("");
    const [valuePercent, setValuePercent] = useState(0);
    const [value, setValue] = useState(0);
    const [updating, setUpdating] = useState(false);
    const min = props.min;
    const max = props.max;
    
    const color = props.color || "#EE8F6E"
    const startAngle = -50;
    const endAngle = 230;
    const nPoints = 360;
  
    useEffect(() => {
      let width = mainDiv.current.clientWidth;
      let centerPoint = { x: width / 2, y: width / 2 };
      let chartRadius = width / 2 - (width / 2) * 0.2;
      setPathBack(
        drawArcSvg(centerPoint, chartRadius, nPoints, startAngle, endAngle)
      );
      setTextX(centerPoint.x - props.fontSize*2/3);
      setTextY(centerPoint.y + props.fontSize*2/3);
    }, []);
    const animateForUpdate = (oldAngle, newAngle) => {
      let width = mainDiv.current.clientWidth;
      let centerPoint = { x: width / 2, y: width / 2 };
      let chartRadius = width / 2 - (width / 2) * 0.2;
      let frame = 10;
  
      if (newAngle > oldAngle) {
        let a1 = -145000;
        let p1 = 0.3;
        let p2 = 1 - p1;
        let x0 = oldAngle;
        let x2 = newAngle;
        let deltaX = x2 - x0;
        let x1 = deltaX * p1 + x0;
        let v1 = Math.sqrt(-2 * a1 * p1 * deltaX);
        let a2 = (-a1 * p1) / p2;
        let dt = frame / 10000;
        let move1 = true;
        let move2 = false;
        let timer;
        let t = 0;
  
        timer = setInterval(() => {
          t += dt;
          if (move1) {
            let x = -0.5 * a1 * t * t + x0;
            setPathFront(
              drawArcSvg(centerPoint, chartRadius, nPoints, startAngle, x)
            );
            if (x >= x1) {
              move1 = false;
              move2 = true;
              t = 0;
            }
          } else if (move2) {
            let x = -0.5 * a2 * t * t + v1 * t + x1;
            setPathFront(
              drawArcSvg(centerPoint, chartRadius, nPoints, startAngle, x)
            );
            if (x >= x2 - 0.1) {
              setUpdating(false);
              clearInterval(timer);
              return;
            }
          }
        }, frame);
      } else if (newAngle < oldAngle) {
        let a1 = -100000;
        let p1 = 0.5;
        let p2 = 1 - p1;
        let x0 = oldAngle;
        let x2 = newAngle;
        let deltaX = -(x2 - x0);
        let x1 = deltaX * p1 + x2;
        let v1 = Math.sqrt(-2 * a1 * p1 * deltaX);
        let a2 = (-a1 * p1) / p2;
        let dt = frame / 10000;
        let move1 = true;
        let move2 = false;
        let timer;
        let t = 0;
  
        timer = setInterval(() => {
          t += dt;
          if (move1) {
            let x = 0.5 * a1 * t * t + x0;
            setPathFront(
              drawArcSvg(centerPoint, chartRadius, nPoints, startAngle, x)
            );
            if (x <= x1) {
              move1 = false;
              move2 = true;
              t = 0;
            }
          } else if (move2) {
            let x = 0.5 * a2 * t * t - v1 * t + x1;
            setPathFront(
              drawArcSvg(centerPoint, chartRadius, nPoints, startAngle, x)
            );
            if (x <= x2 + 1) {
              setUpdating(false);
              clearInterval(timer);
              return;
            }
          }
        }, frame);
      } else {
        setUpdating(false);
      }
    };
  
    const updateData = (newValue) => {
      if (updating) return;
      setUpdating(true);
  
      let oldPercent = value / (max - min);
      let oldAngle = (endAngle - startAngle) * oldPercent + startAngle;
  
      let percent = newValue / (max - min);
  
      setValuePercent(percent * 100);
      setValue(newValue);
  
      let newAngle = (endAngle - startAngle) * percent + startAngle;
  
      animateForUpdate(oldAngle, newAngle);
    };
    useImperativeHandle(ref, () => {
      return {
        updateData: updateData
      };
    });
  
    return (
      <div ref={mainDiv} className="GaugeChart" style={{width, height: width}}>
        <svg>
          <path d={pathBack} fill="none" stroke-width={props.stroke} stroke={"#EBEBEB"} />
          {/* <path d={pathFront} fill="none" stroke-width="20" stroke="#71CFAC" /> */}
          <path d={pathFront} fill="none" stroke-width={props.stroke} stroke={color} />
          {/* <circle
            cx={textX - 15}
            cy={textY - 20}
            r="5"
            fill={updating ? "red" : "green"}
          ></circle> */}
          <text x={textX} y={textY} className="svg-gauge-text-percent" style={{stroke: color, fill: color, color, fontSize: props.fontSize || 18 }}>
            {valuePercent}
          </text>
          
        </svg>
      </div>
    );
  });
  
  
  export default function GaugeContainer({style, ...rest}) {
    const gaugeRef = useRef(null);
    useEffect(() => {
      let timer;
      let randomUpdate = () => {
        gaugeRef.current.updateData(50);
      };
      randomUpdate();
      timer = setInterval(() => {
        randomUpdate();
      }, 13000);
      return () => {
        clearInterval(timer);
      };
    }, []);
  
    return (
      <div
        style={{
          display: "flex",
        //   justifyContent: "center",
        }}
      >
        <div style={style}>
          <GaugeChart width={style?.width} ref={gaugeRef} id="gauge-1" max="250" min="0" {...rest} />
        </div>
      </div>
    );
  }
