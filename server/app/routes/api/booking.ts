// EXPRESS
import { Router } from 'express';
import handleError = require('express-async-handler');
const router = Router();

// MODULES
import { body, param, query } from 'express-validator';
import prisma from '../../modules/prisma';

// IMPORTS
import { validation, authValidation, diseaseValidation, nightValidation, bookingValidation, surgeryValidation } from '../../middlewares/validation';
import { authNZ } from '../../middlewares/passport';

import { patchUser, newUser } from '../../services/auth';
import { Provider, Role } from '@prisma/client';
import { AuthPermissions } from '../../config/authPermissions';


router.post('/new',
  // #swagger.tags = ['Booking']
  // #swagger.path = '/booking/new'

  bookingValidation.name(body('firstName')),
  bookingValidation.name(body('lastName')),
  bookingValidation.email(body('email')),
  bookingValidation.date(body('date_night')),
  bookingValidation.date(body('date_op')),
  bookingValidation.nights(body('nights_plan')),
  surgeryValidation.id(body('surgery')),
  validation,

  async (req, res, next) => {
    try {
      const booking = await prisma.booking.create({
        data: {
          firstName: String(req.body.firstName),
          lastName: String(req.body.lastName),
          email: String(req.body.email),
          date_night: new Date(req.body.date_night),
          date_op: new Date(req.body.date_op),
          nights_plan: parseInt(req.body.nights_plan),
          surgery: {
            connect: {id: req.body.surgery}
          }
        }
      });
      return res.json(booking);
    } catch (error: any) {
      if (error.code == 'P2002') return res.sendStatus(409);
      return next(error);
    }
  });

router.get('/id/:id',
  // #swagger.tags = ['Booking']
  // #swagger.path = '/booking/id/{id}'

  bookingValidation.id(param('id')),
  validation,

  handleError(async (req, res, next) => {
      const booking = await prisma.booking.findUnique({where: {id: req.params.id}});
      if (!booking) return void res.sendStatus(404);
      return void res.json(booking);
  }));

router.get('/find',
  // #swagger.tags = ['Booking']
  // #swagger.path = '/booking/find'
  // #swagger.parameters['firstName'] = {type: 'string'}
  // #swagger.parameters['lastName'] = {type: 'string'}
  // #swagger.parameters['email'] = {type: 'string'}
  // #swagger.parameters['date_start'] = {type: 'string', description: 'yyyy-mm-dd'}
  // #swagger.parameters['date_end'] = {type: 'string', description: 'yyyy-mm-dd'}
  // #swagger.parameters['surgery'] = {type: 'int'}

  bookingValidation.name(query('firstName')).optional(), 
  bookingValidation.name(query('lastName')).optional(),
  bookingValidation.email(query('email')).optional(),
  bookingValidation.date(query('date_start')).optional(),
  bookingValidation.date(query('date_end')).optional(),
  surgeryValidation.id(query('surgery')).optional(),
  validation,

  async (req, res, next) => {
    try {
      const bookings = await prisma.booking.findMany({where: {
        firstName: req.query.firstName ? String(req.query.firstName) : undefined,
        lastName: req.query.lastName ? String(req.query.lastName) : undefined,
        email: req.query.email ? String(req.query.email) : undefined,
        surgeryId: req.query.surgeryId ? parseInt(String(req.query.surgery)) : undefined,
        date_op: {
          lte: req.query.date_end ? new Date(String(req.query.date_end)) : undefined,
          gte: req.query.date_start ? new Date(String(req.query.date_start)) : undefined,
        },
      }});
      return res.json(bookings);  
    } catch (error) {
      next(error)
    }  
  });

router.patch('/id/:id',
  // #swagger.tags = ['Booking']
  // #swagger.path = '/booking/id/{id}'

  bookingValidation.id(param('id')),
  bookingValidation.date(body('date_night')),
  bookingValidation.date(body('date_op')),
  validation,

  async (req, res, next) => {
    try {
      const night = await prisma.booking.update({
        where: {id: String(req.params.id)},
        data: {
          date_night: new Date(req.body.date_night),
          date_op: new Date(req.body.date_op)
        }});
      return res.json(night);
    } catch (error: any) {
      if (error.code == 'P2025') return res.sendStatus(404);
      return next(error);
    }
  });

router.delete('/id/:id',
  // #swagger.tags = ['Booking']
  // #swagger.path = '/booking/id/{id}'

  bookingValidation.id(param('id')),
  validation,

  async (req, res, next) => {
    try {
      const booking = await prisma.booking.delete({where: {id: req.params.id}});
      return res.send();

    } catch (error: any) { 
      if (error.code == 'P2025') return res.sendStatus(404);
      return next(error);
    }
  });

export default router;