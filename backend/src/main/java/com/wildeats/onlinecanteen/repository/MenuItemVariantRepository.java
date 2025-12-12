package com.wildeats.onlinecanteen.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.wildeats.onlinecanteen.entity.MenuItemVariantEntity;

public interface MenuItemVariantRepository extends JpaRepository<MenuItemVariantEntity, Long> {
    List<MenuItemVariantEntity> findByMenuItemItemId(Long itemId);
}
