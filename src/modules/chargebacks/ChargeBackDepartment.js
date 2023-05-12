import React from "react";

export const ChargeBackDepartment = () => {

    return (
        <>
            <div className="chargeback-department">
                <div className="department-header">
                    <div className="dep-top" >
                        <div className="dep-top-left" style={{ color: '#2266E2', backgroundColor: '#E8F0FC' }}>
                            20
                        </div>
                        <div className="dep-top-right">
                            <i style={{ cursor: 'pointer' }} > i </i>
                        </div>

                    </div>
                    <div className="dep-heading">
                        Departments Attributed
                    </div>
                    <div className="dep-subheading">
                        Out of 300 total departments
                    </div>
                    <div className="dep-footer-content">
                        <div className="arror">
                            <img src="./icons/arrow-up.png" alt="" />
                        </div>
                        <div className="arrow-text" style={{ color: "#5FCF64" }}> 20% </div>
                        compared to previous FY.
                    </div>
                </div>

                <div className="department-header">
                    <div className="dep-top">
                        <div className="dep-top-left" style={{ color: '#2266E2', backgroundColor: '#E8F0FC' }}>
                            10k
                        </div>
                        <div className="dep-top-right">
                            <i style={{ cursor: 'pointer' }} > i </i>
                        </div>
                    </div>
                    <div className="dep-heading">
                        Users included in Chargeback
                    </div>
                    <div className="dep-subheading">
                        Out of total 51k Users
                    </div>
                    <div className="dep-footer-content">
                        - No change compared to previous FY.
                    </div>
                </div>


                <div className="department-header">
                    <div className="dep-top">
                        <div className="dep-top-left" style={{ color: '#7807C9', backgroundColor: '#F0DCFF' }}>
                            <span style={{ color: '#2266E2' }}>  $ </span> Sale
                        </div>
                        <div className="dep-top-right" >
                            <i style={{ cursor: 'pointer' }} > i </i>
                        </div>
                    </div>
                    <div className="dep-heading">
                        Highest Load Department
                    </div>
                    <div className="dep-subheading">
                        $ 50k chargeback to Sales.
                    </div>
                    <div className="dep-footer-content">
                        <div className="arror">
                            <img src="./icons/arrow-up.png" alt="" />
                        </div>
                        <div className="arrow-text" style={{ color: "#5FCF64" }}> $ 20k </div>

                        compared to previous FY.
                    </div>
                </div>


                <div className="department-header">
                    <div className="dep-top">
                        <div className="dep-top-right" style={{ color: '#009307', backgroundColor: '#E7F8E8' }}>
                            Mithun Mohan
                        </div>


                        <div className="dep-top-right">
                            <i style={{ cursor: 'pointer' }} > i </i>
                        </div>
                    </div>

                    <div className="dep-heading">
                        Highest Load User
                    </div>
                    <div className="dep-subheading">
                        $ 200 chargeback to Mithun Mohan
                    </div>
                    <div className="dep-footer-content">
                        <div className="arror">
                            <img src="./icons/arrow-down.png" alt="" />
                        </div>
                        <div className="arrow-text" style={{ color: "#FE6955" }}> $ 50 </div>

                        compared to previous FY.
                    </div>
                </div>

            </div>
        </>
    )
}