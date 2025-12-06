import db from '../config/db.js';

export const createCompanyProfile = async (companyData) => {
  const {
    owner_id, company_name, address, city, state, country,
    postal_code, website, industry, description
  } = companyData;

  const query = `
    INSERT INTO company_profile 
    (owner_id, company_name, address, city, state, country, postal_code, website, industry, description)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING *;
  `;

  const values = [
    owner_id, company_name, address, city, state, country,
    postal_code, website, industry, description
  ];

  const { rows } = await db.query(query, values);
  return rows[0];
};

export const getCompanyByOwner = async (owner_id) => {
  const { rows } = await db.query('SELECT * FROM company_profile WHERE owner_id = $1', [owner_id]);
  return rows[0];
};