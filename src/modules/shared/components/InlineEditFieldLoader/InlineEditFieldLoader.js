import React from "react";
import ContentLoader from "react-content-loader";

export function InlineEditFieldLoader(props) {
    return (
        <div className="z__inline_field mr-4 mt-n2" >
            <div className="z__if__header">
                <ContentLoader
                    speed={2}
                    width={45}
                    height={11}
                    viewBox="0 0 45 11"
                    backgroundColor="#f3f3f3"
                    foregroundColor="#ecebeb"
                    {...props}>
                    <rect width="45" height="11" />
                </ContentLoader>
            </div>
            <div className="z__if__body">
                <div className="z__if__before">
                    <ContentLoader
                        speed={2}
                        width={180}
                        height={16}
                        viewBox="0 0 180 16"
                        backgroundColor="#f3f3f3"
                        foregroundColor="#ecebeb"
                        {...props}>
                        <rect width="180" height="16" />
                    </ContentLoader>
                </div>
            </div>
        </div>
    )
}