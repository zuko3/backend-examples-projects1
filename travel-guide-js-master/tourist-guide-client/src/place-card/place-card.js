import React from "react";
import { envConstants } from "../env.constants";
import { Link } from 'react-router-dom';

export function PlaceCard(props) {
    const { place } = props;
    return (
        <div className="w3-card-4 w3-margin w3-white">
            <img src={`${envConstants.BASE_URL}/${place.images[0].imgpath}`} alt="Nature" style={{ width: "100%", height: '300px' }} />
            <div className="w3-container">
                <h3><b>{place.name}</b></h3>
                <h5><span className="w3-opacity">{place.areas}</span></h5>
            </div>

            <div className="w3-container">
                <p>
                    {place.description.substr(0, 300) + "  ...."}
                </p>
                <p>
                    {place.tags.map((tag, index) => (
                        <span key={index} className="w3-tag w3-light-grey w3-small w3-margin-bottom" style={{ marginRight: '3px' }}>
                            {tag}
                        </span>
                    ))}
                </p>
                <div className="w3-row">
                    <div className="w3-col m8 s12">
                        <p>
                            <Link className="w3-button w3-padding-large w3-white w3-border" to={`/details/${place._id}`}>
                                <b>View Details &raquo;</b>
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}