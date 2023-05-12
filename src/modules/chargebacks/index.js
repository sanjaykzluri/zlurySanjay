
/*  
import React, { useContext, useEffect } from "react";
import { Payment } from "../../components";
import { Tabs } from "./Tabs";
import "./Tabs.scss";
import { useLocation, useHistory } from "react-router-dom";
import { Helmet } from "react-helmet";
import RoleContext from "../../services/roleContext/roleContext";
import UnauthorizedToView from "../../common/restrictions/UnauthorizedToView";
import RecognisedTable from "modules/transactions/recognised/Recognised";
import { userRoles } from "../../constants/userRole";
import UnRecognizedTable from "modules/transactions/unrecognised/Unrecognized";
import ArchivedTransactionsTable from "../../components/Transactions/Archived/ArchivedTransactionsTable";
import HeaderTitleBC from "../../components/HeaderTitleAndGlobalSearch/HeaderTitleBC";
import "../../components/Transactions/Archived/Archived.css";
import UploadsTable from "../../components/Uploads/UploadsTable";
import { trackPageSegment } from "modules/shared/utils/segment";
import { getValueFromLocalStorage } from "utils/localStorage";


// my table

import { DepartmentsTable } from './DepartmentsTable'
import { PieChartCom } from './PieChart'




export const ChargeBacks = () => {




    const location = useLocation();
    const history = useHistory();
    const orgName = getValueFromLocalStorage("userInfo")?.org_name;
    const { userRole } = useContext(RoleContext);

    useEffect(() => {
        if (!location.hash.slice(1)) history.push("#recognised");
        trackPageSegment(`${location.hash.substring(1)} `, "Chargebacks");
    }, [location]);

 
    return (
        <>


            {userRole === userRoles.IT_ADMIN ||
                userRole === userRoles.INTEGRATION_ADMIN ||
                userRole === userRoles.SECURITY_ADMIN ? (<UnauthorizedToView />)
                : (
                    <>
                        <HeaderTitleBC title="Chargebacks" />
                        <div style={{ padding: "0px 40px" }}>
                           
                            <Tabs />
                        </div>


                       
                        <PieChartCom />


                        {
                            location.hash === "#departments" ? (
                                <>
                                    <DepartmentsTable />
                                </>
                            ) : null
                        }
                        {location.hash === "#recognised" ? (
                            <>
                                <RecognisedTable />
                                <Helmet>
                                    <title>
                                        {"Recognised Transactions - " +
                                            orgName +
                                            " - " +
                                            getValueFromLocalStorage("partner")
                                                ?.name}
                                    </title>
                                </Helmet>
                            </>
                        ) : null}

                        {location.hash === "#unrecognised" ? (
                            <>
                                <UnRecognizedTable />
                                <Helmet>
                                    <title>
                                        {"Unrecognised Transactions - " +
                                            orgName +
                                            " - " +
                                            getValueFromLocalStorage("partner")
                                                ?.name}
                                    </title>
                                </Helmet>
                            </>
                        ) : null}

                        {location.hash === "#archived" ? (
                            <>
                                <ArchivedTransactionsTable />
                                <Helmet>
                                    <title>
                                        {"Archived Transactions - " +
                                            orgName +
                                            " - " +
                                            getValueFromLocalStorage("partner")
                                                ?.name}
                                    </title>
                                </Helmet>
                            </>
                        ) : null}
                        {location.hash === "#payment-methods" ? (
                            <>
                                <Payment />
                                <Helmet>
                                    <title>
                                        {"Payment Methods - " +
                                            orgName +
                                            " - " +
                                            getValueFromLocalStorage("partner")
                                                ?.name}
                                    </title>
                                </Helmet>
                            </>
                        ) : null}
                        {location.hash === "#uploads" ? (
                            <>
                                <UploadsTable />
                                <Helmet>
                                    <title>
                                        {"Transaction Uploads - " +
                                            orgName +
                                            " - " +
                                            getValueFromLocalStorage("partner")
                                                ?.name}
                                    </title>
                                </Helmet>
                            </>
                        ) : null}
                    </>
                )
            }
        </>
    )
}

*/



import React from "react"
import { PieChartCom } from './PieChart'
import { StackedBarChart } from './StackedBarChart'
import './styles.scss'
import { Tabs } from './Tabs'
import { ChargeBackHeader } from './ChargebackHeader';
import { ChargeBackDepartment } from './ChargeBackDepartment'
import { BatChart } from './BarChart'

export const ChargeBacks = () => {

    return (
        <>
            <div className="chargeBaksContainer">
                <Tabs />
                <ChargeBackHeader />
                <ChargeBackDepartment />
                <BatChart />

                <div className="chart-container">
                    {/* <PieChartCom /> */}
                    {/* <StackedBarChart /> */}
                </div>

            </div>
        </>
    )
}