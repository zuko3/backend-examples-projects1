import React, { useState, useEffect } from "react";
import { envConstants, apiUrls } from "../env.constants";
import { Loader, Error, None, MapView } from "../common";

export function PlaceDetails(props) {
    const { params: { id } } = props.match;
    const [isLoading, setIsLoading] = useState(false);
    const [isError, setIsError] = useState(false);
    const [place, setPlace] = useState(null);

    useEffect(() => {
        window.scrollTo(0, 0)
        const placeDetailsUrls = `${envConstants.BASE_URL}${apiUrls.PLACE_DETAILS}${id}`;
        setIsError(false);
        setIsLoading(true);
        setPlace(null);
        fetch(placeDetailsUrls).then(res => {
            if (res.ok) {
                return res.json();
            } else {
                throw new Error('Something went wrong');
            }
        }).then(response => {
            setIsError(false);
            setIsLoading(false);
            setPlace(response);
        }).catch(err => {
            setIsError(true);
            setIsLoading(false);
            setPlace(null);
        })
    }, [id]);

    if (isLoading) {
        return <Loader />
    }
    else if (isError) {
        return (
            <Error />
        )
    } else if (!place) {
        return <None />
    } else {
        return (
            <div className="w3-card-4 w3-margin w3-white">
                <img src={`${envConstants.BASE_URL}/${place.images[0].imgpath}`} alt="Nature" style={{ width: "100%", height: '300px' }} />
                <div className="w3-container">
                    <h3><b>{place.name}</b></h3>
                    <h5><span className="w3-opacity">{place.areas}</span></h5>
                    <h6>Lattitude:&nbsp;{place.lat},&nbsp;Longitude :&nbsp;{place.lon}</h6>
                    <h6>Additional address details&nbsp;-&nbsp;{place.address}</h6>
                </div>
                <div className="w3-container">
                    {place.tags.map((tag, index) => (
                        <span key={index} className="w3-tag w3-light-grey w3-small w3-margin-bottom" style={{ marginRight: '3px' }}>
                            {tag}
                        </span>
                    ))}
                </div>
                <div className="w3-container">
                    <h5><b>Description:</b></h5>
                    {place.description}
                </div>
                <div className="w3-container">
                    <h5><b>Images:</b></h5>
                    {place.images.map((image, index) => (
                        <React.Fragment key={index}>
                            <img alt="popimage" src={`${envConstants.BASE_URL}/${image.imgpath}`} style={{ margin: '3px', width: "30%", cursor: "zoom-in" }}
                                onClick={() => document.getElementById(`imagepopup${index}`).style.display = 'block'} />

                            <div id={`imagepopup${index}`} className="w3-modal" onClick={() => document.getElementById(`imagepopup${index}`).style.display = 'none'}>
                                <span className="w3-button w3-hover-red w3-xlarge w3-display-topright">&times;</span>
                                <div className="w3-modal-content w3-animate-zoom">
                                    <img alt="placeimage" src={`${envConstants.BASE_URL}/${image.imgpath}`} style={{ width: "100%" }} />
                                </div>
                            </div>
                        </React.Fragment>
                    ))}
                </div>
                <div className="w3-container" style={{ marginTop: '1rem', marginBottom: '1rem' }}>
                    <h5><b>Google Map view:</b></h5>
                    <MapView lat={place.lat} lon={place.lon} />
                    <p>
                        -- Thats All.
                    </p>
                </div>
            </div>
        )
    }

}