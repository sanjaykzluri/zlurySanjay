
import React from "react";
import "./Tabs.scss";
import { TabNavItem } from "./TabNavItem";
import searchIcon from 'modules/chargebacks/assets/searchIcon.svg';
import notifaction from 'modules/chargebacks/assets/notificationIcon.svg';
import note from 'modules/chargebacks/assets/note.svg';
import note2 from 'modules/chargebacks/assets/note2.svg';
import questionMark from 'modules/chargebacks/assets/questionMark.svg';



export function Tabs() {
    return (
        // <ul className="nav nav-tabs">
        //     <TabNavItem
        //         className="recognisedSpellChange"
        //         hash="#departments"
        //         text="Departments"
        //     />
        //     <TabNavItem
        //         className="unrecognisedSpellChange"
        //         hash="#cost-centres"
        //         text="Cost Centres"
        //     />
        //     <TabNavItem hash="#business-units" text="Business Unites" />
        //     <TabNavItem hash="#locations" text="Locations" />

        // </ul>
        <>
            <div className="tabs-container">
                <div className="tabs-heading"> Chargebacks </div>
                <div className="tabs">
                    <button className="active-tab"> Departments</button>
                    <button> Cost Centres</button>
                    <button> Business Unit </button>
                    <button> Locations </button>
                </div>
                <div className="icons">
                    <div className="searchIcon">
                        <img src={searchIcon} alt="search" />
                    </div>

                    <div className="group-icon">
                        <div className="groupIconDiv">
                            <img src={notifaction} alt="notifaction" />
                        </div>
                        <div className="groupIconDiv">
                            <img src={note} alt="note" />
                        </div>
                        <div className="groupIconDiv">
                            <img src={note2} alt="note2" />
                        </div>
                        <div className="groupIconDiv">
                            <img src={questionMark} alt="questionMark" />
                        </div>




                    </div>
                </div>

            </div>
        </>
    );
}


/* 


import React from "react";
import "./Tabs.scss";
import { TabNavItem } from "./TabNavItem";

export function Tabs() {
    return (
        <ul className="nav nav-tabs">
            <TabNavItem
                className="recognisedSpellChange"
                hash="#recognised"
                text="Recognised"
            />
            <TabNavItem
                className="unrecognisedSpellChange"
                hash="#unrecognised"
                text="Unrecognised"
            />
            <TabNavItem hash="#archived" text="Archived" />
            <TabNavItem hash="#payment-methods" text="Payment Methods" />
            <TabNavItem hash="#uploads" text="Uploads" />
        </ul>
    );
}

*/ 