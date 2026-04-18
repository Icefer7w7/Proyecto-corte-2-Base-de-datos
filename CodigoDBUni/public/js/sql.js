function login() {
    let user = document.getElementById("user").value;
    let pass = document.getElementById("pass").value;

    // Login 
    if (user !== "" && pass !== "") {
        document.getElementById("login").style.display = "none";
        document.getElementById("app").style.display = "block";
    } else {
        alert("Ingrese usuario y contraseña");
    }
}

async function register() {
    let user = document.getElementById("userREG").value;
    let pass = document.getElementById("passREG").value;

    const data ={
        email: user,
        password: pass
    }
    try {
        const response = await fetch('/student', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const message = await response.text();

    } catch (error) {
        console.error('Error:', error);
    }
}


async function mostrarSemestre(semesterId) {
    document.getElementById("info").innerText = "Cargando notas del Semestre " + semesterId + "...";

    try {
        const response = await fetch(`/grades/semester/${semesterId}`);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        const notas = await response.json();

        if (!Array.isArray(notas) || notas.length === 0) {
            document.getElementById("info").innerText = "No hay notas para este semestre.";
            return;
        }

        let texto = "Semestre " + semesterId + ":\n";
        notas.forEach((nota, index) => {
            texto += "  Corte " + (index + 1) + ": " + nota.nota_corte + "\n";
        });

        document.getElementById("info").innerText = texto;

    } catch (error) {
        console.error('Error:', error);
        document.getElementById("info").innerText = "Error al cargar las notas.";
    }
}

function calcular() {
    let n1 = parseFloat(document.getElementById("n1").value) || 0;
    let p1 = parseFloat(document.getElementById("p1").value) || 0;

    let n2 = parseFloat(document.getElementById("n2").value) || 0;
    let p2 = parseFloat(document.getElementById("p2").value) || 0;

    let n3 = parseFloat(document.getElementById("n3").value) || 0;
    let p3 = parseFloat(document.getElementById("p3").value) || 0;

    let total = (n1 * p1 + n2 * p2 + n3 * p3) / 100;



    document.getElementById("resultado").innerText =
        "Promedio: " + total.toFixed(2);
}

