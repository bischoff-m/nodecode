# %%

from datacollector.databases import read_sql_query

# display(read_sql_query('select patientid, entriesTotal from SMITH_ASIC_SCHEME.asic_lookup_mimic order by entriesTotal desc limit 10'))
read_sql_query(f'SELECT * FROM SMITH_SepsisDB.d_category')
