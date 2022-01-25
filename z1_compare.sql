-- View: cmd_owner.vm_emply_dprt

-- DROP MATERIALIZED VIEW cmd_owner.vm_emply_dprt;

CREATE MATERIALIZED VIEW cmd_owner.vm_emply_dprt
TABLESPACE pg_default
AS
 WITH tmp_hcm AS (
         SELECT hcm_1.glbl_emply_id,
            hcm_1.acnt_name,
                CASE
                    WHEN upper(hcm_1.acnt_name::text) = 'WFA0134'::text THEN '小U'::text::character varying
                    WHEN upper(hcm_1.acnt_name::text) = 'V6X5394'::text THEN '领导力员工发展'::text::character varying
                    ELSE hcm_1.chinese_name
                END AS chinese_name,
            hcm_1.email,
            hcm_1.cmpny,
            hcm_1.sub_dprtmnt,
            hcm_1.title,
            hcm_1.bus_nd_2_ttl,
            hcm_1.bus_nd_3_ttl,
            hcm_1.stts_ind,
            hcm_1.worker_type,
            hcm_1.worker_sub_type,
            hcm_1.pay_level,
            hcm_1.hiredate,
            hcm_1.sprvsr_glbl_id,
            spr.chinese_name AS sprvsr_chinese_name,
            spr.email AS sprvsr_mail,
                CASE
                    WHEN hcm_1.bus_nd_2_ttl::text = 'Corporate Leadership (JFG)'::text AND hcm_1.bus_nd_3_ttl::text = 'Commercial leadership (BU heads)'::text THEN 'BU'::text
                    WHEN (hcm_1.pay_level::text = ANY (ARRAY['M2'::character varying::text, 'M3'::character varying::text])) AND hcm_1.bus_nd_2_ttl::text = 'Sales (JFG)'::text AND hcm_1.bus_nd_3_ttl::text = 'Sales-Multiple Function'::text THEN
                    CASE
                        WHEN hcm_1.title::text ~~ '%Regional%'::text THEN 'RSD'::text
                        ELSE 'NSD'::text
                    END
                    WHEN hcm_1.pay_level::text = ANY (ARRAY['S6'::character varying::text, 'S7'::character varying::text]) THEN 'DM'::text
                    WHEN hcm_1.pay_level::text = ANY (ARRAY['S1'::character varying::text, 'S1'::character varying::text, 'S2'::character varying::text, 'S3'::character varying::text, 'S4'::character varying::text, 'S5'::character varying::text]) THEN 'MR'::text
                    ELSE NULL::text
                END AS role,
            dprtmnt.dprtmnt AS dprt_dprtmnt,
            dprtmnt.sub_dprtmnt AS dprt_sub_dprtmnt,
            dprtmnt.sls_rgn AS dprt_sls_rgn,
            dprtmnt.cost_cntr_nbr AS dprt_cost_cntr_nbr,
            dprtmnt.cost_cntr_nm AS dprt_cost_cntr_nm
           FROM cmd_owner.hcm_emply hcm_1
             LEFT JOIN cmd_owner.hcm_emply spr ON hcm_1.sprvsr_glbl_id::text = spr.glbl_emply_id::character varying::text AND hcm_1.sprvsr_glbl_id::text <> '0'::text
             LEFT JOIN cmd_owner.hcm_dprtmnt_mppng dprtmnt ON hcm_1.cost_cntr_nbr::text = dprtmnt.cost_cntr_nbr::text
          WHERE 1 = 1 AND (hcm_1.stts_ind = ANY (ARRAY[1, 2])) AND hcm_1.createduser::text <> 'm_emply'::text AND (upper(hcm_1.cmpny::text) = ANY (ARRAY['AFFILIATE'::character varying::text, 'BLANK'::character varying::text])) AND upper(hcm_1.worker_type::text) <> 'CONTINGENT WORKER'::text OR upper(hcm_1.worker_sub_type::text) = 'AGENCY WORKERS'::text AND upper(hcm_1.pay_level::text) <> 'B0'::text AND hcm_1.acnt_name IS NOT NULL AND hcm_1.chinese_name IS NOT NULL AND hcm_1.email IS NOT NULL AND hcm_1.title IS NOT NULL
        ), employees AS (
         SELECT hcm.glbl_emply_id,
            hcm.role,
            hcm.acnt_name,
            hcm.chinese_name,
            hcm.email,
            hcm.cmpny,
            hcm.sub_dprtmnt,
            hcm.title,
            hcm.bus_nd_2_ttl,
            hcm.bus_nd_3_ttl,
            hcm.stts_ind,
            hcm.worker_type,
            hcm.worker_sub_type,
            hcm.pay_level,
            hcm.hiredate,
            hcm.sprvsr_glbl_id,
            hcm.sprvsr_chinese_name,
            hcm.sprvsr_mail,
            hcm.dprt_dprtmnt,
            hcm.dprt_sub_dprtmnt,
            hcm.dprt_sls_rgn,
            hcm.dprt_cost_cntr_nbr,
            hcm.dprt_cost_cntr_nm,
                CASE
                    WHEN bu.buhead_glgl_emply_id = hcm.glbl_emply_id THEN ('BU'::text || ':='::text) || bu.bu_name::text
                    WHEN nsd.nsd_glgl_emply_id = hcm.glbl_emply_id THEN ((('NSD'::text || ':='::text) || nsd.bu_name::text) || ','::text) || nsd.area_name::text
                    WHEN rds.rsd_glgl_emply_id = hcm.glbl_emply_id THEN ((((('RSD'::text || ':='::text) || rds.bu_name::text) || ','::text) || rds.area_name::text) || ','::text) || rds.rgn_name::text
                    WHEN dm.dsm_glgl_emply_id = hcm.glbl_emply_id THEN ((((((('DM'::text || ':='::text) || dm.bu_name::text) || ','::text) || dm.area_name::text) || ','::text) || dm.rgn_name::text) || ','::text) || dm.dstrct_name::text
                    WHEN trtry.rep_glgl_emply_id = hcm.glbl_emply_id THEN ((((((('MR'::text || ':='::text) || trtry.bu_name::text) || ','::text) || trtry.area_name::text) || ','::text) || trtry.rgn_name::text) || ','::text) || trtry.dstrct_name::text
                    ELSE NULL::text
                END AS role_org_path
           FROM tmp_hcm hcm
             LEFT JOIN ( SELECT DISTINCT vm_sales_org.bu_name,
                    vm_sales_org.buhead_glgl_emply_id
                   FROM cmd_owner.vm_sales_org
                  WHERE vm_sales_org.buhead_glgl_emply_id IS NOT NULL AND vm_sales_org.buhead_glgl_emply_id <> 0) bu ON bu.buhead_glgl_emply_id = hcm.glbl_emply_id
             LEFT JOIN ( SELECT DISTINCT vm_sales_org.bu_name,
                    vm_sales_org.buhead_glgl_emply_id,
                    vm_sales_org.area_name,
                    vm_sales_org.nsd_glgl_emply_id
                   FROM cmd_owner.vm_sales_org
                  WHERE vm_sales_org.nsd_glgl_emply_id IS NOT NULL AND vm_sales_org.nsd_glgl_emply_id <> 0) nsd ON nsd.nsd_glgl_emply_id = hcm.glbl_emply_id
             LEFT JOIN ( SELECT DISTINCT vm_sales_org.bu_name,
                    vm_sales_org.buhead_glgl_emply_id,
                    vm_sales_org.area_name,
                    vm_sales_org.nsd_glgl_emply_id,
                    vm_sales_org.rgn_name,
                    vm_sales_org.rsd_glgl_emply_id
                   FROM cmd_owner.vm_sales_org
                  WHERE vm_sales_org.rsd_glgl_emply_id IS NOT NULL AND vm_sales_org.rsd_glgl_emply_id <> 0) rds ON rds.rsd_glgl_emply_id = hcm.glbl_emply_id
             LEFT JOIN ( SELECT DISTINCT vm_sales_org.bu_name,
                    vm_sales_org.buhead_glgl_emply_id,
                    vm_sales_org.area_name,
                    vm_sales_org.nsd_glgl_emply_id,
                    vm_sales_org.rgn_name,
                    vm_sales_org.rsd_glgl_emply_id,
                    vm_sales_org.dstrct_name,
                    vm_sales_org.dsm_glgl_emply_id
                   FROM cmd_owner.vm_sales_org
                  WHERE vm_sales_org.dsm_glgl_emply_id IS NOT NULL AND vm_sales_org.dsm_glgl_emply_id <> 0) dm ON dm.dsm_glgl_emply_id = hcm.glbl_emply_id
             LEFT JOIN cmd_owner.vm_sales_org trtry ON trtry.rep_glgl_emply_id = hcm.glbl_emply_id
        )
 SELECT employees.glbl_emply_id,
    employees.role,
    employees.acnt_name,
    employees.chinese_name,
    employees.email,
    employees.cmpny,
    employees.sub_dprtmnt,
    employees.title,
    employees.bus_nd_2_ttl,
    employees.bus_nd_3_ttl,
    employees.stts_ind,
    employees.worker_type,
    employees.worker_sub_type,
    employees.pay_level,
    employees.hiredate,
    employees.sprvsr_glbl_id,
    employees.sprvsr_chinese_name,
    employees.sprvsr_mail,
    employees.dprt_dprtmnt,
    employees.dprt_sub_dprtmnt,
    employees.dprt_sls_rgn,
    employees.dprt_cost_cntr_nbr,
    employees.dprt_cost_cntr_nm,
    string_agg(employees.role_org_path, '::'::text) AS role_org_path
   FROM employees
  GROUP BY employees.glbl_emply_id, employees.role, employees.acnt_name, employees.chinese_name, employees.email, employees.cmpny, employees.sub_dprtmnt, employees.title, employees.bus_nd_2_ttl, employees.bus_nd_3_ttl, employees.stts_ind, employees.worker_type, employees.worker_sub_type, employees.pay_level, employees.hiredate, employees.sprvsr_glbl_id, employees.sprvsr_chinese_name, employees.sprvsr_mail, employees.dprt_dprtmnt, employees.dprt_sub_dprtmnt, employees.dprt_sls_rgn, employees.dprt_cost_cntr_nbr, employees.dprt_cost_cntr_nm
WITH DATA;

ALTER TABLE cmd_owner.vm_emply_dprt
    OWNER TO cmds_qa_owner;

GRANT ALL ON TABLE cmd_owner.vm_emply_dprt TO cmds_qa_owner;
GRANT ALL ON TABLE cmd_owner.vm_emply_dprt TO r_cmd_owner_rw;