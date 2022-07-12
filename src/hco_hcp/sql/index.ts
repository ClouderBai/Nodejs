export const SrcRef2RefSQL = `
    INSERT INTO cmd_owner.m_ref_hcp_hco (
        is_prmry, afltn_role_cd, afltn_role_name, hcp_id, hco_id, prnt_hco_stts, rcrd_state_cd, is_veeva_master
    ) (
        SELECT src.is_prmry, src.afltn_role_cd, cd.name AS afltn_role_name, srchcp.hcp_id,
        -- hco_vn_entity_id,
        hco.hco_id, src.prnt_hco_stts, src.rcrd_state_cd, src.is_veeva_master
        FROM cmd_owner.m_src_ref_hcp_hco src
        LEFT JOIN cmd_owner.m_src_hcp srchcp ON srchcp.id=src.hcp_id
        LEFT JOIN cmd_owner.m_hco hco ON hco.vn_entity_id=src.hco_vn_entity_id
        LEFT JOIN cmd_owner.m_base_code cd 
            ON cd.base_ctgry_id=(SELECT base_code_ctgry_id FROM cmd_owner.m_base_code_ctgry WHERE ctgry_englsh_name='AffiliationRole')
            AND cd.code=src.afltn_role_cd
    )`;


export const SrcRef2MissHco = `
        SELECT DISTINCT
            hco_vn_entity_id
        FROM        cmd_owner.m_src_ref_hcp_hco     src
        LEFT JOIN   cmd_owner.m_src_hcp             srchcp          ON  srchcp.id=src.hcp_id
        LEFT JOIN   cmd_owner.m_hco                 hco             ON  hco.vn_entity_id=src.hco_vn_entity_id
        LEFT JOIN   cmd_owner.m_base_code           cd              ON  cd.base_ctgry_id=(SELECT base_code_ctgry_id FROM cmd_owner.m_base_code_ctgry WHERE ctgry_englsh_name='AffiliationRole')
                                                                        AND cd.code=src.afltn_role_cd
        WHERE hco.hco_id IS NULL
`



export const SrcDeleteData = `
    DELETE FROM cmd_owner.m_src_ref_hcp_hco;
    DELETE FROM cmd_owner.m_src_hcp;
    TRUNCATE cmd_owner.m_ref_hcp_hco;
    TRUNCATE cmd_owner.m_src_hco;
`

export const SrcResetSequence = `
    SELECT SETVAL('cmd_owner.seq_m_src_ref_hcp_hco', 1, FALSE);
    SELECT SETVAL('cmd_owner.seq_m_src_hco', 1, FALSE);
    SELECT SETVAL('cmd_owner.seq_m_src_hcp', 1, FALSE);
`