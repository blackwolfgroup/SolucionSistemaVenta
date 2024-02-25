using Microsoft.AspNetCore.Mvc;

using AutoMapper;
using SistemaVenta.AplicacionWeb.Models.ViewModels;
using SistemaVenta.AplicacionWeb.Utilidades.Response;
using SistemaVenta.BLL.Interfaces;
using SistemaVenta.Entity;
using Microsoft.AspNetCore.Authorization;

namespace SistemaVenta.AplicacionWeb.Controllers
{
    [Authorize]
    public class ColorController : Controller
    {
        private readonly IMapper _mapper;
        private readonly IColorService _ColorServicio;
        public ColorController(IMapper mapper, IColorService ColorServicio)
        {
            _mapper = mapper;
            _ColorServicio = ColorServicio;
        }

        public IActionResult Index()
        {
            return View();
        }

        [HttpGet]
        public async Task<IActionResult> Lista() { 
            
            List<VMColor> vmColorLista = _mapper.Map<List<VMColor>>( await _ColorServicio.Lista());
            return StatusCode(StatusCodes.Status200OK, new { data = vmColorLista });
        
        }

        [HttpPost]
        public async Task<IActionResult> Crear([FromBody]VMColor modelo)
        {
            GenericResponse<VMColor> gResponse = new GenericResponse<VMColor>();

            try
            {
                Entity.Color Color_creada = await _ColorServicio.Crear(_mapper.Map<Entity.Color>(modelo));
                modelo = _mapper.Map<VMColor>(Color_creada);

                gResponse.Estado = true;
                gResponse.Objeto = modelo;
            }
            catch(Exception ex) {
                gResponse.Estado = false;
                gResponse.Mensaje = ex.Message;
            }

            return StatusCode(StatusCodes.Status200OK, gResponse);
        }

        [HttpPut]
        public async Task<IActionResult> Editar([FromBody] VMColor modelo)
        {
            GenericResponse<VMColor> gResponse = new GenericResponse<VMColor>();

            try
            {
                Entity.Color Color_editada = await _ColorServicio.Editar(_mapper.Map<Entity.Color>(modelo));
                modelo = _mapper.Map<VMColor>(Color_editada);

                gResponse.Estado = true;
                gResponse.Objeto = modelo;
            }
            catch (Exception ex)
            {
                gResponse.Estado = false;
                gResponse.Mensaje = ex.Message;
            }

            return StatusCode(StatusCodes.Status200OK, gResponse);
        }

        [HttpDelete]
        public async Task<IActionResult> Eliminar(int IdColor) {

            GenericResponse<string> gResponse = new GenericResponse<string>();
            try
            {
                gResponse.Estado = await _ColorServicio.Eliminar(IdColor);

            }
            catch (Exception ex) {
                gResponse.Estado = false;
                gResponse.Mensaje = ex.Message;
            }
            return StatusCode(StatusCodes.Status200OK, gResponse);
        }

    }
}
