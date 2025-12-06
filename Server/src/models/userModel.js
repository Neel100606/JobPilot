import db from '../config/db.js';

export const createUser = async ({ email, password, full_name, gender, mobile_no, signup_type = 'e' }) => {
  const query = `
    INSERT INTO users (email, password, full_name, gender, mobile_no, signup_type)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING id, email, full_name, mobile_no;
  `;
  const values = [email, password, full_name, gender, mobile_no, signup_type];
  const { rows } = await db.query(query, values);
  return rows[0];
};

export const findUserByEmail = async (email) => {
  const { rows } = await db.query('SELECT * FROM users WHERE email = $1', [email]);
  return rows[0];
};

export const findUserByMobile = async (mobile) => {
  const { rows } = await db.query('SELECT * FROM users WHERE mobile_no = $1', [mobile]);
  return rows[0];
};