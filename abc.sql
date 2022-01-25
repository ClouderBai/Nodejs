update cmd_owner.m_sales_prd set been_moved = false, end_cycle=209912 where id=20000705 AND prd_gk = '3313';

update cmd_owner.m_sales_prd set been_moved = false, end_cycle=209912 where id=20002359 AND prd_gk = '3Z0112' ;

update cmd_owner.m_sales_prd set been_moved = false, end_cycle=209912,stts_ind = 1 where id=20008734 AND prd_gk = '3Z1003' ;

update cmd_owner.m_sales_prd set been_moved = false, end_cycle=209912,stts_ind = 1 where id=20002758 AND prd_gk = '3Z0105' ;

update cmd_owner.m_sales_prd set been_moved = false, end_cycle=209912,stts_ind = 1 where prd_gk in ('3Z0103',   '3Z0107', '3Z0113', '3Z0111', '3Z0108', '331301', '331303', '331305', '331304', '331302', '321509');
