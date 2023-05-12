import React, { useState , useEffect} from 'react';
import { CircularProgressbarWithChildren } from 'react-circular-progressbar';
import AnimatedProgressProvider from '../../common/AnimatedProgressProvider.js';
import 'react-circular-progressbar/dist/styles.css';
import "./Onboarding.css";
import warning from './warning.svg';
import completed from '../../components/Settings/Billing/check.svg';
import {easeQuadInOut} from 'd3-ease';
import { Loader } from '../../common/Loader/Loader.js';

function CircularProgress(props) {
    const [showRetryButton, setShowRetryButton] = useState(false);

    useEffect(() => {
        setTimeout(() => {
			setShowRetryButton(true);
		}, 5000);
    },[])

    return (
        <div className="d-flex flex-column ml-auto mr-auto mt-3 mb-auto">
            <div className="d-inline-flex m-auto" style={{ width: "40%" }}> 
                <AnimatedProgressProvider
                    valueStart={0}
                    valueEnd={props.value}
                    duration={5}
                    easingFunction={easeQuadInOut}
                >
                    {(value) => {
                        const roundedValue = Math.round(value);
                        return (
                            <CircularProgressbarWithChildren
                                value={value}
                                strokeWidth={2}
                                styles={{
                                    trail: {
                                        stroke: "#DDDDDD",
                                        width: 2
                                    },
                                    path: {
                                        stroke: (props.status != null && !props.status) ? "#FF6767" : "#40E395",
                                        transition: 'stroke-dashoffset 0.5s ease 0s',
                                        transformOrigin: 'center center',
                                    }
                                }}
                            >
                                <div className="insideContent">
                                    {props.fillImage}
                                </div>
                            </CircularProgressbarWithChildren>
                        );
                    }}
                </AnimatedProgressProvider>        
            </div>
            <div className="d-flex justify-content-center align-items-center mt-3">
                <span className="CircularProgressHeading text-center">{props.heading}</span> {props.status != null ? <img className="ml-2" src={props.status ? completed : warning}></img> : null}
            </div>
            <span className="text-center CircularProgressDescription mt-2">
                {props.description}
            </span>
            {
                showRetryButton?
                (
                    !props.status ?
                    <div className="d-flex" style={{height: "50px"}}>
                        <div onClick={props.isLoading ? null : props.func} className="btn btn-link m-auto d-flex align-items-center" style={{fontSize: "13px", width: "fit-content"}}>
                        {
                            props.isLoading &&
                                <Loader
                                    height={40}
                                    width={40}
                                />
                        }
                        {props.buttonName}
                        </div> 
                    </div>
                    : 
                        null
                )
                : 
                    null
            }
        </div>
    );
}

export default CircularProgress;

