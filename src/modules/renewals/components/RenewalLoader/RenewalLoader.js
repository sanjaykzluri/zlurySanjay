import React from "react";
import ContentLoader from "react-content-loader";

export function RenewalLoader(props) {

    const dayLoader = [1, 2, 3].map((res, index) => (
        <div className="day-container__day d-flex flex-row pt-2 pb-2 align-items-center align-items-stretch" key={index}>
            <div className="day__header text-uppercase text-center font-500 ">
                <ContentLoader
                    speed={2}
                    width={30}
                    height={30}
                    viewBox="0 0 30 30"
                    backgroundColor="#f3f3f3"
                    foregroundColor="#ecebeb"
                    {...props}>
                    <circle cx="15" cy="15" r="15" />
                </ContentLoader>
            </div>
            <div className="day__body flex-fill p-2 ">
                <div className="day__body-event d-flex flex-row p-2 z__header-ternary align-items-center">
                    <div className="" style={{ width: '30%' }}>
                        <ContentLoader
                            speed={2}
                            width={150}
                            height={16}
                            viewBox="0 0 150 16"
                            backgroundColor="#f3f3f3"
                            foregroundColor="#ecebeb"
                            {...props}>
                            <rect width="150" height="16" />
                        </ContentLoader>
                    </div>
                    <div className=" grey-1" style={{ width: '14%' }}>
                        <ContentLoader
                            speed={2}
                            width={80}
                            height={16}
                            viewBox="0 0 80 16"
                            backgroundColor="#f3f3f3"
                            foregroundColor="#ecebeb"
                            {...props}>
                            <rect width="80" height="16" />
                        </ContentLoader>
                    </div>
                    <div className=" grey-1" style={{ width: '14%' }}>
                        <ContentLoader
                            speed={2}
                            width={80}
                            height={16}
                            viewBox="0 0 80 16"
                            backgroundColor="#f3f3f3"
                            foregroundColor="#ecebeb"
                            {...props}>
                            <rect width="80" height="16" />
                        </ContentLoader>
                    </div>
                    <div className=" bold-500" style={{ width: '14%' }}>
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
                    </div>
                    <div className=" position-relative" style={{ width: '19%' }}>
                        <ContentLoader
                            speed={2}
                            width={125}
                            height={16}
                            viewBox="0 0 125 16"
                            backgroundColor="#f3f3f3"
                            foregroundColor="#ecebeb"
                            {...props}>
                            <rect width="125" height="16" />
                        </ContentLoader>
                    </div>
                    <div className="  position-relative" style={{ width: '9%' }}>
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
                    </div>
                </div>
            </div>
        </div>
    ))

    const monthLoader = [1, 2].map((res, index) => (
        <div className="month-block mb-6" key={index}>
            <div className="month-block__header mb-3">
                <div className="d-flex flex-row">
                    <ContentLoader
                        speed={2}
                        width={400}
                        height={16}
                        viewBox="0 0 400 16"
                        backgroundColor="#f3f3f3"
                        foregroundColor="#ecebeb"
                        {...props}>
                        <rect width="132" height="16" />
                    </ContentLoader>
                </div>
            </div>
            <div className="month-block__day-container">
                {dayLoader}
            </div>
        </div>
    ))

    return (
        <div>
            {monthLoader}
        </div>
    )
}