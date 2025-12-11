package com.wildeats.onlinecanteen.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Pattern;

public class CreateShopRequest {

    @NotBlank(message = "Shop name is required")
    @Size(min = 1, max = 100, message = "Shop name must be between 1 and 100 characters")
    private String shopName;

    @NotBlank(message = "Shop description is required")
    @Size(min = 1, max = 500, message = "Shop description must be between 1 and 500 characters")
    private String shopDescr;

    @NotBlank(message = "Shop address is required")
    @Size(max = 200, message = "Shop address must not exceed 200 characters")
    private String shopAddress;

    @NotBlank(message = "Location is required")
    private String location; // Will be validated as enum

    @NotBlank(message = "Contact number is required")
    @Pattern(regexp = "^(09|\\+639)\\d{9}$", message = "Contact number must be a valid Philippine mobile number (e.g., 09171234567 or +639171234567)")
    private String contactNumber;

    public CreateShopRequest() {
    }

    public CreateShopRequest(String shopName, String shopDescr, String shopAddress,
            String location, String contactNumber) {
        this.shopName = shopName;
        this.shopDescr = shopDescr;
        this.shopAddress = shopAddress;
        this.location = location;
        this.contactNumber = contactNumber;
    }

    public String getShopName() {
        return shopName;
    }

    public void setShopName(String shopName) {
        this.shopName = shopName;
    }

    public String getShopDescr() {
        return shopDescr;
    }

    public void setShopDescr(String shopDescr) {
        this.shopDescr = shopDescr;
    }

    public String getShopAddress() {
        return shopAddress;
    }

    public void setShopAddress(String shopAddress) {
        this.shopAddress = shopAddress;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getContactNumber() {
        return contactNumber;
    }

    public void setContactNumber(String contactNumber) {
        this.contactNumber = contactNumber;
    }
}