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

export const updateCompany = async (owner_id, updateData) => {
  const {
    company_name, address, city, state, country,
    postal_code, website, industry, description, 
    logo_url, banner_url
  } = updateData;

  // We update only the fields provided. 
  // Note: For a real production app, we might build this query dynamically. 
  // For this assignment, we update the whole record or use COALESCE in SQL 
  // to keep old values if new ones are null, but here is a simple full update query:

  const query = `
    UPDATE company_profile
    SET 
      company_name = $2, address = $3, city = $4, state = $5, country = $6,
      postal_code = $7, website = $8, industry = $9, description = $10,
      logo_url = COALESCE($11, logo_url), 
      banner_url = COALESCE($12, banner_url),
      updated_at = CURRENT_TIMESTAMP
    WHERE owner_id = $1
    RETURNING *;
  `;

  const values = [
    owner_id, company_name, address, city, state, country,
    postal_code, website, industry, description, logo_url, banner_url
  ];

  const { rows } = await db.query(query, values);
  return rows[0];
};