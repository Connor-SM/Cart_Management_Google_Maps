// initialize variables
var url = "./assets/products.json";
var total = 0;

$(document).ready(function(){
  // show cart right away if there are items
  getCart();

  // Add smooth scrolling to all links
  $("a").on('click', function(event) {

    // Make sure this.hash has a value before overriding default behavior
    if (this.hash !== "") {
      // Prevent default anchor click behavior
      event.preventDefault();

      // Store hash
      var hash = this.hash;

      // Using jQuery's animate() method to add smooth page scroll
      // The optional number (800) specifies the number of milliseconds it takes to scroll to the specified area
      $('html, body').animate({
        scrollTop: $(hash).offset().top
      }, 800, function(){

        // Add hash (#) to URL when done scrolling (default click behavior)
        window.location.hash = hash;
      });
    } // End if
  });
});

// get records right away to display
$.getJSON(url, function (record) {
  var HTML = '';
  $.each(record, function (index, product) {
    // for each record input a product display
    HTML += '<div class="product" id="' + product.id + '"><figure>' +
          '<img src="http://placehold.it/200x200" alt="Image">' +
          '<figcaption>' + product.name + '<br><span>$' +
          product.price.toFixed(2) + '</span></figcaption></figure>' +
        '<button onclick="addProduct(' + product.id + ')"' + 'class="product_button">Add To Cart</button></div>'
  });
  $(".products").html(HTML);
});

// when adding a product
function addProduct(product_id) {
  // get each record to match to id
  $.getJSON("./assets/products.json", function (record) {
    $.each(record, function (index, product) {
      // if id is equal then push to cart
      if (product.id == product_id) {
        cart.push(product);

        // read and write to the database with new cart items
        writeUserData(cart);
        getCart();
      };
    });
  });
}

// when removing a product
function removeProduct(product_id) {
  // get all products
  $.getJSON("./assets/products.json", function (record) {
    // sort through each record
    $.each(record, function (index, product) {
      // if we have a match remove the product
      if (product.id == product_id) {
        // loop through the cart and remove
        for (var i = 0; i < cart.length; i++) {
          if (product.name == cart[i].name) {
            cart.splice(i, 1);
            break;
          }
        }
        // read and write the new cart to database
        writeUserData(cart);
        getCart();
      };
    });
  });
}

// remove a product from the side cart displayed
function remove_from_cart(product_id) {
  removeProduct(product_id);
}

// call google mops api
function showMap() {
  var map;
  function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
      center: {lat: 38.9072, lng: -77.0369},
      zoom: 14
    });
    map.data.setStyle(function(feature) {
      return {
        title: feature.getProperty('name'),
        optimized: false
      };
    });
    var cities = {
      type: 'FeatureCollection',
      features: [{
        type: 'Feature',
        geometry: {type: 'Point', coordinates: [-77.0369, 38.9072]},
        properties: {name: 'Coding Temple'}
      }]
    }

    map.data.addGeoJson(cities);
  }
  initMap();
}

// write to firebase
function writeUserData(cart) {
  firebase.database().ref('cart').set({
    'items': cart
  });
}

// check for multiples of the item being indexed and return an id with a count
function checkDuplicate(cart, index) {
  var count = 0;
  for (var i = index; i < cart.length; i++) {
    if (cart[index].id == cart[i].id) {
      count += 1;
    };
  };
  return count
}

// show the side cart -- add on for later when using json to hold cart
function showCart(cart, duplicate_ids) {
  // get total value for cart
  var newTotal = getCartTotal(cart);

  // change the html for cart total displayed
  $('#cart-total').html(
    '<a href="#" onclick="getCart()">Cart: $' + newTotal + '</a>');

  // make sure cart isn't null, or else will throw error
  if (cart === null) {
    $('#cart').css('display', 'none');
    duplicate_ids = [];
  } else {
    // keep list of id's for duplicates
    // var duplicate_ids = [];

    // change html for cart on side
    var HTML = '<h3 class="cart_title">Cart</h3>';
    for (var i = 0; i < cart.length; i++) {
      var quantity = checkDuplicate(cart, i);

      var flag = false;

      // if the id was already pushed to duplicates then don't show
      for (var j = 0; j <= cart.length; j++) {
        if (cart[i].id == duplicate_ids[j]) {
          flag = true;
          break;
        }
      };
      if (flag == false) {
        HTML += '<h5 class="cart_product_title">(' +
        quantity + ')  ' + cart[i].name +
        '<span class="cart_price">$' + cart[i].price.toFixed(2) + '</span>' +
        '<button onclick="remove_from_cart(' + cart[i].id + ')" ' + 'class="remove_cart_button">X</button></h5>';

        // add id to duplicates
        duplicate_ids.push(cart[i].id);
      };
    };
    HTML += '<h5 class="total_title">Total: ' + newTotal + '</h5>'

    $('#cart').html(HTML);

    // show cart
    $('#cart').css('display', 'block');
  };
}

// get cart items from firebase
function getCart() {
  var current_cart = firebase.database().ref('cart/items');
  current_cart.on('value', function(items) {
    showCart(items.val(), []);
    if (items.val() == null) {
      cart = [];
    } else {
      cart = items.val();
    };
  });
}

function getCartTotal(cart) {
  var total = 0;
  if (cart === null) {
    return total.toFixed(2);
  } else {
    for (var i = 0; i < cart.length; i++) {
      total += cart[i].price;
    };
  };
  return total.toFixed(2);
}
