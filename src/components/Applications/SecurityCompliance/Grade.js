import React from "react";
import _ from "underscore";
import whiteCheck from "../../../assets/whiteCheck.svg";
import white_close from "../../../assets/white_close.svg";

function Grade(props) {

    const GRADE_COLORS = {
        GREEN: "#2D882D",
        GREYISH_YELLOW: "#AAAA39",
        LIGHT_BROWN: "#AA7039",
        RED: "#AA3939",
        DARK_BROWN: "#894848",
        PURPLE: "#652770",
        GREY: "#717171"
    }

    const getBackgroundColorClassByValue = (val) => {

        const matchedLetter = ((val).toString().toUpperCase()).match(/[a-z0-9]/gi);
        const grade = matchedLetter?.[0] || '?';

        if (_.contains(["A", "I", "M", "1"], grade)) {
            return GRADE_COLORS.GREEN;
        }
        if (_.contains(["D", "?"], grade)) {
            return GRADE_COLORS.PURPLE;
        }
        if (_.contains(["B"], grade)) {
            return GRADE_COLORS.GREYISH_YELLOW
        }
        if (_.contains(["C"], grade)) {
            return GRADE_COLORS.LIGHT_BROWN
        }
        if (_.contains(["E"], grade)) {
            return GRADE_COLORS.DARK_BROWN
        }
        if (_.contains(["O"], grade)) {
            return GRADE_COLORS.GREY
        }
        if (_.contains(["F", "0"], grade)) {
            return GRADE_COLORS.RED
        }
    }

    return (
        <>
            {
                props.isScanning ?
                    <div className={`grade ${props.className}`} style={{ ...props.style, backgroundColor: "#DDDDDD" }}>
                        <span>
                            ?
                        </span>
                    </div>
                    :
                    <div className={`grade ${props.className}`} style={{ ...props.style, backgroundColor: `${getBackgroundColorClassByValue(props.value)}` }}>
                        <span>
                            {
                                _.isNumber(props.value) ?
                                    (props.value === 1 ? <img height={18} width={35} src={whiteCheck} /> : <img height={18} width={18} src={white_close} />)
                                    :
                                    (props.value || '?')
                            }
                        </span>
                    </div>
            }
        </>
    )
};

export default Grade;