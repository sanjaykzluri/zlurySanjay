import React from "react";
import ContentLoader from "react-content-loader";

export function CustomFieldLoader(props) {

    const list = [1, 2, 3].map((res, index) => (
        <div key={index} className="cf-card mb-3 p-2 pl-3 pr-3 mr-3 pointer">
            <div className="mb-1">
                <p className="z__header-ternary bold-400 m-0">
                    <ContentLoader
                        speed={2}
                        width={50}
                        height={16}
                        viewBox="0 0 50 16"
                        backgroundColor="#f3f3f3"
                        foregroundColor="#ecebeb"
                        {...props}>
                        <rect width="50" height="16" />
                    </ContentLoader>
                </p>
            </div>
            <div>
                <p className="z__description-secondary text-capitalize m-0">
                    <ContentLoader
                        speed={2}
                        width={50}
                        height={16}
                        viewBox="0 0 50 16"
                        backgroundColor="#f3f3f3"
                        foregroundColor="#ecebeb"
                        {...props}>
                        <rect width="50" height="16" />
                    </ContentLoader>
                </p>
            </div>
        </div>
    ))

    const sections = [1, 2, 3].map((res, index) => (
        <div key={index} className="cf-section pb-4 mb-4">
            <div className="cf__section-header mb-3">
                <h4 className="z__header-ternary text-capitalize d-flex bold-600 ">
                    <ContentLoader
                        speed={2}
                        width={50}
                        height={16}
                        viewBox="0 0 50 16"
                        backgroundColor="#f3f3f3"
                        foregroundColor="#ecebeb"
                        {...props}>
                        <rect width="50" height="16" />
                    </ContentLoader>
                </h4>
            </div>
            <div className="cf__sections-body d-flex flex-row flex-wrap">
                {list}
            </div>
        </div>
    ))

    return (
        <div className="custom-fields__body">
            {sections}
        </div>
    )
}