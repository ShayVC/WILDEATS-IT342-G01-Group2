package com.wildeats.onlinecanteen.dto;

import java.util.List;

import com.wildeats.onlinecanteen.entity.MenuItemAddonEntity;
import com.wildeats.onlinecanteen.entity.MenuItemFlavorEntity;
import com.wildeats.onlinecanteen.entity.MenuItemVariantEntity;

public class MenuItemOptionsDTO {

    public List<MenuItemVariantEntity> variants;
    public List<MenuItemAddonEntity> addons;
    public List<MenuItemFlavorEntity> flavors;

    public MenuItemOptionsDTO(List<MenuItemVariantEntity> v, List<MenuItemAddonEntity> a,
            List<MenuItemFlavorEntity> f) {
        this.variants = v;
        this.addons = a;
        this.flavors = f;
    }
}
