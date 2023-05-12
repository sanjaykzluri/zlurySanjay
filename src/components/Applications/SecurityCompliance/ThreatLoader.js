import React from "react";
import ContentLoader from "react-content-loader";
import check from '../../Integrations/greenTick.svg';
import _ from "underscore";

function ThreatLoader() {
    return (
        <div className="m-4 border rounded">
            <div className="d-flex flex-column mt-3">
                <div className="threatsHeading p-4">
                    <div className="d-flex flex-row">
                        <ContentLoader
                            height={17}
                            backgroundColor="#dadada"
                            foregroundColor="#e4e3e3"
                        >
                            <rect width="100" height="17" rx="2" y="0" x="20" />
                        </ContentLoader>
                        <div className="ml-auto">
                            {
                                _.times(5, () => (
                                    <ContentLoader
                                        speed={1}
                                        width={14}
                                        height={15}
                                        viewBox="0 0 118 132"
                                        backgroundColor="#dadada"
                                        foregroundColor="#e4e3e3"
                                        style={{ marginLeft: "2px" }}
                                    >
                                        <path d="M 112.034 28.69 L 64.411 1.475 L 58.847 0 l -5.563 1.474 L 5.65 28.691 l -4.133 4.106 L 0 38.422 V 92.66 l 1.517 5.625 l 4.133 4.106 l 47.59 27.173 l 5.564 1.475 l 5.564 -1.475 l 47.623 -27.215 l 4.146 -4.08 l 1.547 -5.609 v -54.24 l -1.518 -5.624 l -4.132 -4.106 z" />
                                    </ContentLoader>
                                ))
                            }
                        </div>
                    </div>
                    <div className="d-flex flex-row">
                        <div className="grey-1 font-13 mt-1">
                            <ContentLoader
                                height={13}
                                backgroundColor="#dadada"
                                foregroundColor="#e4e3e3">
                                <rect width="180" height="13" rx="2" y="0" x="20" />
                            </ContentLoader>
                        </div>
                    </div>
                </div>
            </div>
            <div className="bg-white pl-4 pr-4 pb-4">
                {
                    _.times(5, () => (
                        <div className="border-left-0 border-top-0 border-right-0 card" style={{ borderBottom: "0.5px solid #EBEBEB" }}>
                            <div className="bg-white d-flex border-0 font-13 grey card-header flex-column">
                                <div className="d-flex flex-row">
                                    <img className="mr-2" src={check}></img>
                                    <div className="ml-2 mt-auto mb-auto">
                                        <ContentLoader
                                            height={10}
                                        >
                                            <rect width="197" height="10" rx="2" y="0" x="0" fill="#EBEBEB" />
                                        </ContentLoader>
                                    </div>
                                </div>
                                <div className="d-flex flex-row mt-1" style={{ paddingLeft: "21px" }}>
                                    <ContentLoader
                                        height={10}
                                        width={130}
                                    >
                                        <rect width="17" height="10" rx="2" y="0" x="8" fill="#EBEBEB" />
                                        <circle cx="35" cy="5" r="5" fill="#EBEBEB" />
                                        <rect width="1" height="10" rx="2" y="0" x="48" fill="#EBEBEB" />
                                        <rect width="63" height="10" rx="2" y="0" x="61" fill="#EBEBEB" />
                                    </ContentLoader>
                                    {
                                        _.times(5, () => (
                                            <ContentLoader
                                                speed={1}
                                                width={9}
                                                height={10}
                                                viewBox="0 0 118 132"
                                                backgroundColor="#EBEBEB"
                                                foregroundColor="#e4e3e3"
                                                style={{ marginLeft: "2px" }}
                                            >
                                                <path d="M 112.034 28.69 L 64.411 1.475 L 58.847 0 l -5.563 1.474 L 5.65 28.691 l -4.133 4.106 L 0 38.422 V 92.66 l 1.517 5.625 l 4.133 4.106 l 47.59 27.173 l 5.564 1.475 l 5.564 -1.475 l 47.623 -27.215 l 4.146 -4.08 l 1.547 -5.609 v -54.24 l -1.518 -5.624 l -4.132 -4.106 z" />
                                            </ContentLoader>
                                        ))
                                    }
                                </div>
                            </div>
                        </div>
                    ))
                }
            </div>
        </div>
    )
}

export default ThreatLoader;