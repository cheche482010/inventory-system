const successResponse = (res, data, message = "Operación exitosa", statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  })
}

const errorResponse = (res, message = "Error interno", statusCode = 500, errors = null) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors,
  })
}

const paginatedResponse = (res, data, pagination, message = "Datos obtenidos") => {
  return res.status(200).json({
    success: true,
    message,
    data,
    pagination,
  })
}

module.exports = {
  successResponse,
  errorResponse,
  paginatedResponse,
}
