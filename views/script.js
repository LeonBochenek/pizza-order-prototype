let pizzaidCounter = 1;
let orderedPizzas = [];
let choosenFilters = [];

//wykonanie fetcha api i zwrot obiektu pizzas
async function getPizzas() {
  const response = await fetch("/api/pizza");
  const data = await response.json();
  return data.pizzas;
}


async function getAllergens() {
  const response = await fetch("/api/allergens");
  const data = await response.json();
  return data.allergens;
}

// na funkcji wykonanie map w celu wyświetlenia  kluczy/wartosc
getPizzas().then(pizzas => {
  const pizzaElements = pizzas.map(pizza => {
    const imageName = pizza.name.replace(/\W/g, "_");
    const imageUrl = `images/${imageName}.jpg`;
    const element = document.createElement("pizzaBox");
    element.innerHTML = `<div class= "element" id="pizza-${pizza.id}">
    <img src="${imageUrl}" alt="${pizza.name}" class="img-size">
    <h1 class="centered">${pizza.name}</h1><span class="ingredients">${pizza.ingredients}</span>
      <h2 class="centered">${pizza.price}</h2>
      <input type="button" value="-" class="minus">
      <input type="number" step="1" min="1" max="" name="quantity" value="1" class="input-text" size="4" pattern="" inputmode="">
      <input type="button" value="+" class="plus">
      
      <button class="cta" id="${parseInt(pizzaidCounter)}">ORDER</button>
     <div>`;

    pizzaidCounter += 1;

    //send to order endpoint
    element.querySelector(".cta").addEventListener("click", function (event) {
      const pizzaAmountInput = event.target.parentElement.firstElementChild.nextElementSibling.
        nextElementSibling.nextElementSibling.nextElementSibling.nextElementSibling.value;
      const chosenPizzas = { id: +event.target.id, amount: +pizzaAmountInput };
      orderedPizzas.push(chosenPizzas);
      console.log(orderedPizzas);

      const formDiv = document.querySelector(".form-container");
      formDiv.innerHTML = "";
      const orderForm = document.createElement("form");
      orderForm.id = "order-form"
      const nameLabel = document.createElement("label");
      nameLabel.for = "nameInput";
      nameLabel.textContent = "Enter your name: "
      const emailLabel = document.createElement("label");
      emailLabel.for = "emailInput";
      emailLabel.textContent = "Enter your e-mail address: "
      const cityLabel = document.createElement("label");
      cityLabel.for = "emailInput";
      cityLabel.textContent = "Enter your city: "
      const streetLabel = document.createElement("label");
      streetLabel.for = "emailInput";
      streetLabel.textContent = "Enter your street address: "
      const nameInput = document.createElement("input");
      nameInput.type = "text";
      nameInput.id = "name";
      nameInput.name = "name";
      const emailInput = document.createElement("input");
      emailInput.type = "email"
      emailInput.id = "email";
      emailInput.name = "email";
      const cityInput = document.createElement("input");
      cityInput.type = "text";
      cityInput.id = "city";
      cityInput.name = "city";
      const streetInput = document.createElement("input");
      streetInput.type = "text";
      streetInput.id = "street";
      streetInput.name = "street";
      const orderSubmit = document.createElement("button");
      orderSubmit.type = "button";
      orderSubmit.id = "send";
      orderSubmit.textContent = "Place your order here!";

      formDiv.appendChild(orderForm);
      orderForm.appendChild(nameLabel);
      orderForm.appendChild(nameInput);
      orderForm.appendChild(emailLabel);
      orderForm.appendChild(emailInput);
      orderForm.appendChild(cityLabel);
      orderForm.appendChild(cityInput);
      orderForm.appendChild(streetLabel);
      orderForm.appendChild(streetInput);
      orderForm.appendChild(orderSubmit);

      sendOrder();
    });
    return element;
  });

  getAllergens().then(allergens => {
    const allergensElement = allergens.map(allergen => {
      const allergenButton = document.createElement("allergensBox");
      allergenButton.innerHTML = `<button class = "allergenElement" id = "${allergen.id}">${allergen.name}</button>`

      allergenButton.querySelector(".allergenElement").addEventListener("click", function (e) {
        var target = e.target;

        target.classList.toggle("change");
      }, false);

      allergenButton.querySelector(".allergenElement").addEventListener("click", function (event) {
        modifyChoosenFilters(event);
        pizzas.forEach(pizza => {
          const pizzaToHide = document.getElementById("pizza-" + pizza.id)
          if (pizzaToHide.style.display != "none" && choosenFilters.includes(event.target.id)) {
            modifyVisibility(pizza, event, pizzaToHide, "none");
          } else if (pizzaToHide.style.display == "none" && !choosenFilters.includes(event.target.id) && checkAllergens(pizza)) {
            modifyVisibility(pizza, event, pizzaToHide, "inline");
          }
        })
      })
      return allergenButton;
    })

    const container = document.getElementById("allergensContainer");
    allergensElement.forEach(nextElement => container.appendChild(nextElement))
  })

  const container = document.getElementById("container");
  pizzaElements.forEach(element => container.appendChild(element));
});

function checkAllergens(pizza) {
  let ifContains = true;
  pizza.allergens.forEach(allergen => {
    choosenFilters.forEach(filter => {
      if (filter == allergen) {
        ifContains = false;
      }
    })
  })
  return ifContains;
}

function modifyChoosenFilters(event) {
  if (choosenFilters.includes(event.target.id)) {
    for (i = 0; i < choosenFilters.length; i++) {
      if (choosenFilters[i] == event.target.id) {
        choosenFilters.splice(i, 1);
      }
    }
  } else {
    choosenFilters.push(event.target.id);
  }
}

function modifyVisibility(pizza, event, pizzaToHide, type) {
  pizza.allergens.forEach(allergen => {
    if (allergen == event.target.id) {
      pizzaToHide.style.display = type;
    }
  })
}


function sendOrder() {
  document.querySelector("#send").addEventListener("click", () => {
    const timeOfOrder = new Date().toJSON().slice(0, 16);
    const timeOfOrderYear = +timeOfOrder.slice(0, 4);
    const timeOfOrderMonth = +timeOfOrder.slice(5, 7);
    const timeOfOrderDay = +timeOfOrder.slice(8, 10);
    const timeOfOrderHour = +timeOfOrder.slice(11, 13) + 1;
    const timeOfOrderMinute = +timeOfOrder.slice(14);
    let order = {
      pizzas: orderedPizzas,
      date: {
        year: timeOfOrderYear,
        month: timeOfOrderMonth,
        day: timeOfOrderDay,
        hour: timeOfOrderHour,
        minute: timeOfOrderMinute
      },
      customer: {
        name: document.getElementById("name").value,
        email: document.getElementById("email").value,
        address: {
          city: document.getElementById("city").value,
          street: document.getElementById("street").value
        }
      }
    }
    order = JSON.stringify(order);
    console.log(order);
    fetch("/api/orders", {
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json"
      },
      method: "POST",
      body: order
    })
      .then(response => response.json())
      .then(data => console.log(data))
    orderedPizzas = [];
    document.querySelector("#order-form").remove();
  });
}