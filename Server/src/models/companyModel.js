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
    founded_date, social_links, 
    logo_url, banner_url
  } = updateData;

  const query = `
    UPDATE company_profile
    SET 
      company_name = COALESCE($2, company_name),
      address = COALESCE($3, address),
      city = COALESCE($4, city),
      state = COALESCE($5, state),
      country = COALESCE($6, country),
      postal_code = COALESCE($7, postal_code),
      website = COALESCE($8, website),
      industry = COALESCE($9, industry),
      description = COALESCE($10, description),
      founded_date = COALESCE($11, founded_date),
      social_links = COALESCE($12, social_links),
      logo_url = COALESCE($13, logo_url), 
      banner_url = COALESCE($14, banner_url),
      updated_at = CURRENT_TIMESTAMP
    WHERE owner_id = $1
    RETURNING *;
  `;

  const values = [
    owner_id, company_name, address, city, state, country,
    postal_code, website, industry, description, 
    founded_date, social_links, // Added
    logo_url, banner_url
  ];

  const { rows } = await db.query(query, values);
  return rows[0];
};