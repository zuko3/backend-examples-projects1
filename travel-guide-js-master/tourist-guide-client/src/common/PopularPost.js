import React, { useState, useEffect } from "react";
import { envConstants, apiUrls } from "../env.constants";
import { Loader, Error, None, history } from "../common";


export function PopularPost(props) {
    const [isLoading, setIsLoading] = useState(false);
    const [isError, setIsError] = useState(false);
    const [place, setPlace] = useState([]);

    useEffect(() => {
        window.scrollTo(0, 0)
        const placeDetailsUrls = `${envConstants.BASE_URL}${apiUrls.PLACE_POPULAR}`;
        setIsError(false);
        setIsLoading(true);
        setPlace([]);
        fetch(placeDetailsUrls).then(res => {
            if (res.ok) {
                return res.json();
            } else {
                throw new Error('Something went wrong');
            }
        }).then(response => {
            setIsError(false);
            setIsLoading(false);
            setPlace(response.places || []);
        }).catch(err => {
            setIsError(true);
            setIsLoading(false);
            setPlace([]);
        })
    }, []);

    if (isLoading) {
        return (
            <div className="w3-card w3-margin">
                <div className="w3-container w3-padding" style={{ backgroundColor: '#f1f1f1' }}>
                    <h4>Popular Place</h4>
                </div>
                <div className="w3-container w3-white">
                    <Loader />
                </div>
            </div>
        )
    }
    else if (isError) {
        return (
            <div className="w3-card w3-margin">
                <div className="w3-container w3-padding" style={{ backgroundColor: '#f1f1f1' }}>
                    <h4>Popular Place</h4>
                </div>
                <div className="w3-container w3-white">
                    <Error />
                </div>
            </div>
        )


    } else if (place.length === 0) {
        return (
            <div className="w3-card w3-margin">
                <div className="w3-container w3-padding" style={{ backgroundColor: '#f1f1f1' }}>
                    <h4>Popular Place</h4>
                </div>
                <div className="w3-container w3-white">
                    <None />
                </div>
            </div>
        )

    } else {

        return (
            <div className="w3-card w3-margin">
                <div className="w3-container w3-padding" style={{ backgroundColor: '#f1f1f1' }}>
                    <h4>Popular Place</h4>
                </div>
                <ul className="w3-ul w3-hoverable w3-white">
                    {place.map((p, index) => (
                        <li onClick={() => history.push(`/details/${p._id}`)} key={index} className="w3-padding-16" style={{ curosr: "pointer" }}>
                            <img src={`${envConstants.BASE_URL}/${p.images[0].imgpath}`} alt="popularpost" className="w3-left w3-margin-right" style={{ width: "50px" }} />
                            <span className="w3-large">{p.name}</span><br />
                            <span>{p.areas}</span>
                        </li>
                    ))}

                </ul>
            </div>
        )

    }

}