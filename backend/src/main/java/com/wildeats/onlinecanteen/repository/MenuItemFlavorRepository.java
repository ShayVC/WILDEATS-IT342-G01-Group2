package com.wildeats.onlinecanteen.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.wildeats.onlinecanteen.entity.MenuItemFlavorEntity;

public interface MenuItemFlavorRepository extends JpaRepository<MenuItemFlavorEntity, Long> {
    List<MenuItemFlavorEntity> findByMenuItemItemId(Long itemId);
}
