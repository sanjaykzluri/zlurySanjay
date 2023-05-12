import React from "react";
import './styles.scss';
import settingIcon from 'modules/chargebacks/assets/setting.svg';


export const ChargeBackHeader = () => {
    return (
        <>
            <div className="chargeback-header">
                <div className="left-header">
                    <div className="active-user">
                        <span>
                            <img src="./icons/level-cart.png" />
                        </span>
                    </div>
                    <div className="user">
                        <div className="user-img">
                            <img src="./icons/user.png" />

                        </div>
                        <div className="user-text">
                            <h3 className="user-text__heading"> Sanjay </h3>
                            <p className="user-text__data">  Application finance Owner</p>
                        </div>
                    </div>
                </div>


                <div className="right-header">
                    <div className="active-user">
                        <img src="./icons/user.png" />
                        Alert
                    </div>
                    <div className="user">
                        <img src={settingIcon} alt="setting" /> sanjay kumar
                    </div>
                </div>

            </div>
        </>
    )
}