import React from 'react';
import { Link } from 'react-router-dom';
import './ApplicationPending.css';

const ApplicationPending = () => {
    return (
        <div className="pending-container">
            <div className="form-card">
                <h1 className="form-header">Application Pending</h1>
                <p className="pending-message">
                    Your shop application has been submitted and is awaiting admin review.
                </p>
                <p className="pending-subtext">
                    You’ll receive access to the Seller Dashboard once approved.
                </p>

                <div className="form-footer">
                    <Link className="styled-link" to="/">Back to Home</Link>
                </div>
            </div>
        </div>
    );
};

export default ApplicationPending;
