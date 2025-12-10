import { createCompanyProfile, getCompanyByOwner, updateCompany } from '../models/companyModel.js';
import cloudinary from '../config/cloudinary.js';
import db from '../config/db.js';
// @desc    Register new company
// @route   POST /api/company/register
// @access  Private
export const registerCompany = async (req, res) => {
  try {
    const { 
      company_name, address, city, state, country, 
      postal_code, website, industry, description 
    } = req.body;

    // The user ID comes from the JWT middleware (req.user.id)
    const owner_id = req.user.id; 

    // 1. Check if user already has a company (enforce one company per user)
    const existingCompany = await getCompanyByOwner(owner_id);
    if (existingCompany) {
      return res.status(400).json({ success: false, message: 'User already has a company profile' });
    }

    // 2. Create Profile
    const newCompany = await createCompanyProfile({
      owner_id,
      company_name, address, city, state, country,
      postal_code, website, industry, description
    });

    res.status(201).json({
      success: true,
      message: 'Company profile created successfully',
      data: newCompany
    });

  } catch (error) {
    console.error('Company Register Error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Upload company logo/banner
// @route   POST /api/company/upload-logo OR /api/company/upload-banner
// @access  Private
export const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'company_uploads',
    });

    const imageUrl = result.secure_url;
    const owner_id = req.user.id;

    const fieldName = req.file.fieldname;

    let dbColumn;
    if (fieldName === 'logo') dbColumn = 'logo_url';
    else if (fieldName === 'banner') dbColumn = 'banner_url';
    else return res.status(400).json({ success: false, message: 'Invalid field name' });

    const query = `
      UPDATE company_profile 
      SET ${dbColumn} = $1, updated_at = CURRENT_TIMESTAMP 
      WHERE owner_id = $2 
      RETURNING *;
    `;

    const { rows } = await db.query(query, [imageUrl, owner_id]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Company profile not found. Create profile first.' });
    }

    // We return the URL so the frontend can send it back with the profile data
    // OR we can update the DB directly if the company already exists.
    // Based on the flow, we'll return the URL.
    res.status(200).json({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        url: result.secure_url,
        public_id: result.public_id
      }
    });

  } catch (error) {
    console.error('Upload Error:', error);
    res.status(500).json({ success: false, message: 'Image upload failed' });
  }
};

// @desc    Get company profile
// @route   GET /api/company/profile
// @access  Private
export const getCompanyProfile = async (req, res) => {
  try {
    const owner_id = req.user.id;
    const company = await getCompanyByOwner(owner_id);

    if (!company) {
      return res.status(404).json({ success: false, message: 'Company profile not found' });
    }

    res.status(200).json({
      success: true,
      data: company
    });
  } catch (error) {
    console.error('Get Profile Error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Update company profile
// @route   PUT /api/company/profile
// @access  Private
export const updateCompanyProfile = async (req, res) => {
  try {
    const owner_id = req.user.id;
    let { 
      company_name, address, city, state, country, 
      postal_code, website, industry, description,
      founded_date, social_links 
    } = req.body;

    // --- FIX: Handle Empty Date String ---
    // Postgres crashes if you send "" for a DATE column. We must send NULL instead.
    if (founded_date === '') {
      founded_date = null;
    }

    const existingCompany = await getCompanyByOwner(owner_id);
    if (!existingCompany) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    const updatedCompany = await updateCompany(owner_id, {
        ...existingCompany, 
        company_name, address, city, state, country, 
        postal_code, website, industry, description,
        founded_date, social_links,
        // Ensure we don't accidentally wipe images if frontend didn't send them
        logo_url: existingCompany.logo_url, 
        banner_url: existingCompany.banner_url
    });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedCompany
    });

  } catch (error) {
    console.error('Update Profile Error:', error);
    // This will now print the exact DB error in your terminal if it still fails
    res.status(500).json({ success: false, message: 'Server Error: ' + error.message });
  }
};