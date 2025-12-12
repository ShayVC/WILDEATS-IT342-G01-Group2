package com.wildeats.onlinecanteen.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.wildeats.onlinecanteen.entity.MenuItemAddonEntity;

public interface MenuItemAddonRepository extends JpaRepository<MenuItemAddonEntity, Long> {
    List<MenuItemAddonEntity> findByMenuItemItemId(Long itemId);
}
