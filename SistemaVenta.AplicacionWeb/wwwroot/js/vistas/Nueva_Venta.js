﻿let ValorImpuesto = 0;
$(document).ready(function () {


    fetch("/Venta/ListaTipoDocumentoVenta")
        .then(response => {
            return response.ok ? response.json() : Promise.reject(response);
        })
        .then(responseJson => {
            if (responseJson.length > 0) {
                responseJson.forEach((item) => {
                    $("#cboTipoDocumentoVenta").append(
                        $("<option>").val(item.idTipoDocumentoVenta).text(item.descripcion)
                    )
                })
            }
        })



    fetch("/Negocio/Obtener")
        .then(response => {
            return response.ok ? response.json() : Promise.reject(response);
        })
        .then(responseJson => {

            if (responseJson.estado) {

                const d = responseJson.objeto;

                console.log(d)

                $("#inputGroupSubTotal").text(`Sub total - ${d.simboloMoneda}`)
                $("#inputGroupIGV").text(`IGV(${d.porcentajeImpuesto}%) - ${d.simboloMoneda}`)
                $("#inputGroupTotal").text(`Total - ${d.simboloMoneda}`)

                ValorImpuesto = parseFloat(d.porcentajeImpuesto)
            }

        })

    $("#cboBuscarProducto").select2({
        ajax: {
            url: "/Venta/ObtenerProductos",
            dataType: 'json',
            contentType: "application/json; charset=utf-8",
            delay: 250,
            data: function (params) {
                return {
                    busqueda: params.term
                };
            },
            processResults: function (data,) {

                return {
                    results: data.map((item) => (
                        {
                            id: item.idProducto,
                            text: item.descripcion,

                            marca: item.marca,
                            categoria: item.nombreCategoria,
                            urlImagen: item.urlImagen,
                            precio: parseFloat(item.precio),
                            precioEfectivo: parseFloat(item.precioEfectivo),
                            precioTarjeta: parseFloat(item.precioTarjeta)
                        }
                    ))
                };
            }
        },
        language: "es",
        placeholder: 'Buscar Producto...',
        minimumInputLength: 1,
        templateResult: formatoResultados
    });



})

function formatoResultados(data) {

    //esto es por defecto, ya que muestra el "buscando..."
    if (data.loading)
        return data.text;

    var contenedor = $(
        `<table width="100%">
            <tr>
                <td style="width:60px">
                    <img style="height:60px;width:60px;margin-right:10px" src="${data.urlImagen}"/>
                </td>
                <td>
                    <p style="font-weight: bolder;margin:2px">${data.marca}</p>
                    <p style="margin:2px">${data.text}</p>
                </td>
            </tr>
         </table>`
    );

    return contenedor;
}

$(document).on("select2:open", function () {
    document.querySelector(".select2-search__field").focus();
})

let ProductosParaVenta = [];

$("#cboBuscarProducto").on("select2:select", function (e) {
    const data = e.params.data;

    let producto_encontrado = ProductosParaVenta.filter(p => p.idProducto == data.id)
    if (producto_encontrado.length > 0) {
        $("#cboBuscarProducto").val("").trigger("change")
        toastr.warning("", "El producto ya fue agregado")
        return false
    }

    const customSwal = swal.mixin({
        confirmButtonText: 'Aceptar',
        cancelButtonText: 'Cancelar',
        showCancelButton: true,
        showLoaderOnConfirm: true,
        progressSteps: ['1']
    });

    customSwal.queue([{
        title: data.marca,
        text: data.text,
        imageUrl: data.urlImagen,
        input: 'text',
        inputPlaceholder: 'Ingrese Cantidad',
        preConfirm: (value) => {
            return new Promise((resolve) => {
                if (!value || isNaN(parseInt(value))) {
                    toastr.warning('', 'Debe ingresar un valor numérico');
                    resolve(false);
                } else {
                    resolve(value);
                }
            });
        }
    }]).then((result) => {
        if (result.value) {
            const cantidad = parseInt(result.value[0]);

            const tipoPrecioSeleccionado = $("#cboTipoPrecio").val();

            let precio = data.precio.toString();

            if (tipoPrecioSeleccionado == "efectivo") {
                precio = data.precioEfectivo.toString();
            } else if (tipoPrecioSeleccionado == "tarjeta") {
                precio = data.precioTarjeta.toString();
            }

            let producto = {
                idProducto: data.id,
                marcaProducto: data.marca,
                descripcionProducto: data.text,
                categoriaProducto: data.categoria,
                cantidad: cantidad,
                precio: precio,
                precioLista: data.precio.toString(),
                precioEfectivo: data.precioEfectivo.toString(),
                precioTarjeta: data.precioTarjeta.toString(),
                total: (parseFloat(cantidad) * precio).toString()
            }

            ProductosParaVenta.push(producto);

            mostrarProducto_Precios();
            $("#cboBuscarProducto").val("").trigger("change");
        }
    });
});



function mostrarProducto_Precios() {

    let total = 0;
    let igv = 0;
    let subtotal = 0;
    let porcentaje = ValorImpuesto / 100;

    $("#tbProducto tbody").html("")

    ProductosParaVenta.forEach((item) => {

        total = total + parseFloat(item.total)

        $("#tbProducto tbody").append(
            $("<tr>").append(
                $("<td>").append(
                    $("<button>").addClass("btn btn-danger btn-eliminar btn-sm").append(
                        $("<i>").addClass("fas fa-trash-alt")
                    ).data("idProducto", item.idProducto)
                ),
                $("<td>").text(item.descripcionProducto),
                $("<td>").text(item.cantidad),
                $("<td>").text(item.precio),
                $("<td>").text(item.total)
            )
        )
    })

    subtotal = total / (1 + porcentaje);
    igv = total - subtotal;

    $("#txtSubTotal").val(subtotal.toFixed(2))
    $("#txtIGV").val(igv.toFixed(2))
    $("#txtTotal").val(total.toFixed(2))


}

$(document).on("click", "button.btn-eliminar", function () {

    const _idproducto = $(this).data("idProducto")

    ProductosParaVenta = ProductosParaVenta.filter(p => p.idProducto != _idproducto);

    mostrarProducto_Precios();
})


$("#btnTerminarVenta").click(function () {

    if (ProductosParaVenta.length < 1) {
        toastr.warning("", "Debe ingresar productos")
        return;
    }

    const vmDetalleVenta = ProductosParaVenta;

    const venta = {
        idTipoDocumentoVenta: $("#cboTipoDocumentoVenta").val(),
        documentoCliente: $("#txtDocumentoCliente").val(),
        nombreCliente: $("#txtNombreCliente").val(),
        subTotal: $("#txtSubTotal").val(),
        impuestoTotal: $("#txtIGV").val(),
        total: $("#txtTotal").val(),
        DetalleVenta: vmDetalleVenta
    }

    $("#btnTerminarVenta").LoadingOverlay("show");

    fetch("/Venta/RegistrarVenta", {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify(venta)
    })
    .then(response => {
        $("#btnTerminarVenta").LoadingOverlay("hide");
        return response.ok ? response.json() : Promise.reject(response);
    })
    .then(responseJson => {

        if (responseJson.estado) {
            ProductosParaVenta = [];
            mostrarProducto_Precios();

            $("#txtDocumentoCliente").val("")
            $("#txtNombreCliente").val("")
            $("#cboTipoDocumentoVenta").val($("#cboTipoDocumentoVenta option:first").val())
            
            const url = `/Venta/MostrarPDFVenta?numeroVenta=${responseJson.objeto.numeroVenta}`;

            window.open(url, "_blank");
            
            swal2("Registrado!", `Numero Venta : ${responseJson.objeto.numeroVenta}`, "success")
        } else {
            swal2("Lo sentimos!", "No se pudo registrar la venta", "error")
        }
    })
})

function handleTipoPrecioChange() {
    const tipoPrecioSeleccionado = $("#cboTipoPrecio").val();

    ProductosParaVenta.forEach(x => {
        if (tipoPrecioSeleccionado === "lista") {
            x.precio = x.precioLista
        } else if (tipoPrecioSeleccionado === "efectivo") {
            x.precio = x.precioEfectivo
        } else if (tipoPrecioSeleccionado === "tarjeta") {
            x.precio = x.precioTarjeta
        }

        x.total = (parseFloat(x.cantidad) * x.precio).toString()
    });

    mostrarProducto_Precios();
}

$("#cboTipoPrecio").on("change", handleTipoPrecioChange);