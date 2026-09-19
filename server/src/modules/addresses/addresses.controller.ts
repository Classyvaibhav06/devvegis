import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../../config/prisma';
import { AuthRequest } from '../../middleware/auth';
import { AppError } from '../../middleware/errorHandler';

const MAX_ADDRESSES_PER_USER = 10;

export const getAddresses = async (req: AuthRequest, res: Response): Promise<void> => {
  const addresses = await prisma.address.findMany({
    where: { userId: req.user!.id },
    orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
  });
  res.json({ success: true, data: addresses });
};

export const addAddress = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user!.id;

  // DB Flooding Protection: Limit max saved addresses per user
  const count = await prisma.address.count({ where: { userId } });
  if (count >= MAX_ADDRESSES_PER_USER) {
    throw new AppError(
      `Maximum limit of ${MAX_ADDRESSES_PER_USER} saved addresses reached. Please remove an existing address first.`,
      400,
      'ADDRESS_LIMIT_EXCEEDED'
    );
  }

  const { name, phone, addressLine1, addressLine2, landmark, city, state, pincode, label, isDefault, latitude, longitude } = req.body;

  // Strict Sanitization & Validation
  const cleanName = String(name || '').trim().slice(0, 50);
  const cleanPhone = String(phone || '').trim().replace(/[\s\-\(\)]/g, '');
  const cleanAddress1 = String(addressLine1 || '').trim().slice(0, 120);
  const cleanAddress2 = addressLine2 ? String(addressLine2).trim().slice(0, 120) : null;
  const cleanLandmark = landmark ? String(landmark).trim().slice(0, 80) : null;
  const cleanCity = String(city || '').trim().slice(0, 50);
  const cleanState = String(state || '').trim().slice(0, 50);
  const cleanPincode = String(pincode || '').trim();
  const cleanLabel = ['Home', 'Work', 'Other'].includes(String(label)) ? String(label) : 'Home';

  if (!cleanName || cleanName.length < 2) {
    throw new AppError('Recipient name is required (min 2 characters)', 400, 'VALIDATION_ERROR');
  }
  if (!/^(\+91)?[6-9]\d{9}$/.test(cleanPhone)) {
    throw new AppError('Valid 10-digit Indian phone number is required', 400, 'VALIDATION_ERROR');
  }
  if (!cleanAddress1 || cleanAddress1.length < 5) {
    throw new AppError('Street address / House number is required (min 5 characters)', 400, 'VALIDATION_ERROR');
  }
  if (!cleanCity || cleanCity.length < 2) {
    throw new AppError('City is required', 400, 'VALIDATION_ERROR');
  }
  if (!cleanState || cleanState.length < 2) {
    throw new AppError('State is required', 400, 'VALIDATION_ERROR');
  }
  if (!/^[1-9][0-9]{5}$/.test(cleanPincode)) {
    throw new AppError('Valid 6-digit postal pincode is required', 400, 'VALIDATION_ERROR');
  }

  // If set to default or this is user's first address, unset previous defaults
  const shouldBeDefault = Boolean(isDefault) || count === 0;
  if (shouldBeDefault) {
    await prisma.address.updateMany({
      where: { userId },
      data: { isDefault: false },
    });
  }

  const address = await prisma.address.create({
    data: {
      id: uuidv4(),
      userId,
      label: cleanLabel,
      name: cleanName,
      phone: cleanPhone,
      addressLine1: cleanAddress1,
      addressLine2: cleanAddress2,
      landmark: cleanLandmark,
      city: cleanCity,
      state: cleanState,
      pincode: cleanPincode,
      latitude: typeof latitude === 'number' ? latitude : null,
      longitude: typeof longitude === 'number' ? longitude : null,
      isDefault: shouldBeDefault,
    },
  });

  res.status(201).json({ success: true, data: address });
};

export const updateAddress = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const userId = req.user!.id;

  const existing = await prisma.address.findFirst({ where: { id, userId } });
  if (!existing) throw new AppError('Address not found', 404, 'NOT_FOUND');

  const { name, phone, addressLine1, addressLine2, landmark, city, state, pincode, label, isDefault, latitude, longitude } = req.body;

  const updateData: any = {};
  if (name !== undefined) {
    const clean = String(name).trim().slice(0, 50);
    if (clean.length < 2) throw new AppError('Recipient name must be at least 2 characters', 400);
    updateData.name = clean;
  }
  if (phone !== undefined) {
    const clean = String(phone).trim().replace(/[\s\-\(\)]/g, '');
    if (!/^(\+91)?[6-9]\d{9}$/.test(clean)) throw new AppError('Valid 10-digit Indian mobile number required', 400);
    updateData.phone = clean;
  }
  if (addressLine1 !== undefined) {
    const clean = String(addressLine1).trim().slice(0, 120);
    if (clean.length < 5) throw new AppError('Address line 1 must be at least 5 characters', 400);
    updateData.addressLine1 = clean;
  }
  if (addressLine2 !== undefined) {
    updateData.addressLine2 = addressLine2 ? String(addressLine2).trim().slice(0, 120) : null;
  }
  if (landmark !== undefined) {
    updateData.landmark = landmark ? String(landmark).trim().slice(0, 80) : null;
  }
  if (city !== undefined) {
    const clean = String(city).trim().slice(0, 50);
    if (clean.length < 2) throw new AppError('City is required', 400);
    updateData.city = clean;
  }
  if (state !== undefined) {
    const clean = String(state).trim().slice(0, 50);
    if (clean.length < 2) throw new AppError('State is required', 400);
    updateData.state = clean;
  }
  if (pincode !== undefined) {
    const clean = String(pincode).trim();
    if (!/^[1-9][0-9]{5}$/.test(clean)) throw new AppError('Valid 6-digit pincode is required', 400);
    updateData.pincode = clean;
  }
  if (label !== undefined) {
    updateData.label = ['Home', 'Work', 'Other'].includes(String(label)) ? String(label) : 'Home';
  }
  if (latitude !== undefined) updateData.latitude = typeof latitude === 'number' ? latitude : null;
  if (longitude !== undefined) updateData.longitude = typeof longitude === 'number' ? longitude : null;

  if (isDefault) {
    await prisma.address.updateMany({ where: { userId }, data: { isDefault: false } });
    updateData.isDefault = true;
  }

  const updated = await prisma.address.update({ where: { id }, data: updateData });
  res.json({ success: true, data: updated });
};

export const deleteAddress = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const userId = req.user!.id;
  const address = await prisma.address.findFirst({ where: { id, userId } });
  if (!address) throw new AppError('Address not found', 404, 'NOT_FOUND');

  await prisma.address.delete({ where: { id } });

  // If deleted address was default, promote another address if available
  if (address.isDefault) {
    const remaining = await prisma.address.findFirst({ where: { userId }, orderBy: { createdAt: 'desc' } });
    if (remaining) {
      await prisma.address.update({ where: { id: remaining.id }, data: { isDefault: true } });
    }
  }

  res.json({ success: true, message: 'Address deleted' });
};

