
-- Procedimiento ObtenerEstadisticasGenerales

DELIMITER $$

DROP PROCEDURE IF EXISTS obtenerEstadisticasGenerales $$

CREATE PROCEDURE obtenerEstadisticasGenerales()
BEGIN
    SELECT
        COALESCE((
            SELECT SUM(precio_total)
            FROM reservas
        ), 0) AS ingresos_totales,

        COALESCE((
            SELECT COUNT(*)
            FROM cabana
        ), 0) AS cabanas_totales,

        COALESCE((
            SELECT COUNT(*)
            FROM reservas
        ), 0) AS reservas_totales,

        COALESCE((
            SELECT AVG(precio_por_noche)
            FROM cabana
        ), 0) AS tarifa_promedio;
END $$

DELIMITER ;

--CALL obtenerEstadisticasGenerales();

DELIMITER //

-- Procedimiento ObtenerEstadisticas

CREATE PROCEDURE obtenerEstadisticasSecundarias()
BEGIN
    -- Declaramos variables temporales para almacenar los cálculos
    DECLARE v_nuevas_reservas INT DEFAULT 0;
    DECLARE v_en_mantenimiento INT DEFAULT 0;
    DECLARE v_cabana_estrella VARCHAR(255) DEFAULT 'Sin datos aún';
    DECLARE v_ingreso_por_huesped DECIMAL(10,2) DEFAULT 0.00;

    -- 1. Nuevas reservas en los últimos 7 días
    -- Asegúrate de que 'created_at' sea el nombre de tu columna de fecha
    SELECT COUNT(*) INTO v_nuevas_reservas
    FROM reservas
    WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY);

    -- 2. Cabañas en mantenimiento (Asumiendo que idEstado = 3 es mantenimiento)
    SELECT COUNT(*) INTO v_en_mantenimiento
    FROM cabana
    WHERE id_estado = 2;

    -- 3. Cabaña Estrella (La más reservada)
    -- Une la tabla reservas con cabanas para obtener el nombre
    SET v_cabana_estrella = IFNULL((
        SELECT c.nombre
        FROM reservas r
        JOIN cabana c ON r.id_cabana = c.id_cabana
        GROUP BY r.id_cabana, c.nombre
        ORDER BY COUNT(*) DESC
        LIMIT 1
    ), 'Sin datos aún');

    -- 4. Ingreso por Reserva/Huésped (Total ingresos / Cantidad de reservas)
  
    SELECT IFNULL(SUM(precio_total) / NULLIF(COUNT(*), 0), 0) INTO v_ingreso_por_huesped
    FROM reservas;
    

    -- Finalmente, devolvemos las 4 columnas con los nombres exactos que necesitas
    SELECT 
        v_nuevas_reservas AS nuevas_reservas_semana,
        v_en_mantenimiento AS cabanas_en_mantenimiento,
        v_cabana_estrella AS cabana_estrella,
        v_ingreso_por_huesped AS ingreso_por_huesped;
END //

DELIMITER ;

-- Procedimiento AgregarCabana
DELIMITER $$

DROP PROCEDURE IF EXISTS agregarCabana $$

CREATE PROCEDURE agregarCabana(
    IN p_nombre VARCHAR(254),
    IN p_descripcion VARCHAR(800),
    IN p_capacidad INT,
    IN p_habitaciones INT,
    IN p_precio_por_noche DECIMAL(12,2),
    IN p_img_url VARCHAR(255),
    OUT p_id_cabana INT -- Ahora espera 7 parámetros en total
)
BEGIN
    DECLARE v_slug VARCHAR(254);

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;

    SET v_slug = LOWER(REPLACE(TRIM(p_nombre), ' ', '-'));

    INSERT INTO cabana (
        nombre,
        descripcion,
        precio_por_noche,
        capacidad,
        habitaciones,
        slug,
        img_url,
        id_estado,
        created_at,
        updated_at
    )
    VALUES (
        p_nombre,
        p_descripcion,
        p_precio_por_noche,
        p_capacidad,
        p_habitaciones,
        v_slug,
        p_img_url,
        1,
        NOW(),
        NOW()
    );

    SET p_id_cabana = LAST_INSERT_ID();

    COMMIT;
END $$

DELIMITER ;