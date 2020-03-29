# import necessary libraries
from flask import Flask, render_template, jsonify, request, redirect
from flask_pymongo import PyMongo
import requests
from bson.json_util import dumps


#################################################
# Flask Setup
#################################################
app = Flask(__name__)

# track the application-level data during a request
app.app_context().push()

#################################################
# Database Setup
#################################################

# Distributed under the MIT license - http://opensource.org/licenses/MIT
 #__author__ = 'mLab'

# Use flask_pymongo to set up mongo connection
app.config["MONGO_URI"] = "mongodb://heroku_p85w0z3s:1hj6d4lipj3bbqn5p8j6lu30vc@ds311538.mlab.com:11538/heroku_p85w0z3s?retryWrites=false"
mongo = PyMongo(app)


# create route that renders index.html template
@app.route("/")
def home():
    return render_template("index.html")


# Query the database and send the jsonified results
@app.route("/add", methods=["GET", "POST"])
def add():
    if request.method == "POST":
        addressTitle = request.form["Title"]
        address = request.form["Address"]
        town = request.form["town"]
        province = request.form["state"]
        lat = request.form["Lat"]
        lng = request.form["Lon"]
        connectionTitle = request.form["Plug_type"]
        ID = request.form["ID"]
        levelID = request.form["Level"]
        POcode = request.form["POcode"]

        new_location = {
            "AddressInfo" : {
                "Title" : addressTitle,
                "AddressLine1" : address,
                "Town" : town,
                "StateOrProvince" : province,
                "Latitude" : lat,
                "Longitude" : lng,
                "Postcode" : POcode
            },
            "Connections" : [{
                "ConnectionType" : {
                    "Title" : connectionTitle
                },
                "LevelID" : ID,
                "Level" : {
                    "Title" : levelID
                }
            }]
        }
        # Insert the new location data into database collection called stations
        mongo.db.newStations.insert(new_location)
        return redirect("/search", code=302)

    return render_template("Add.html")


@app.route("/api/allocations") # This route returns you a json string of the total stations(api stations and user added stations)
def locations():
    # Fetch all data from database and jsonify it
    # Get the api stations from mongodb and convert it to a python list
    apidata_list = list(mongo.db.OpenData.find())
    # Get the user stations from mongodb and convert it to a python list
    user_list = list(mongo.db.newStations.find())
    # Merge/union the two list together
    total_list = apidata_list + user_list
    # Convert the list back to json string which can then be used in JS
    data = dumps(total_list)
    # Replace all null values with Unknown
    # data = data.replace("null","Unknown")
    # Return the result for this route so when this route is called, the json string is a response
    return data

# @app.route("/api/types")
# def types():
#     data = mongo.db.OpenData.distinct("Connections.ConnectionType.Title")
#     print(dumps(data))
#     return dumps(data)

@app.route("/search")
def search():
    return render_template("search_new.html")

# @app.route("/login")
# def login():
#     return render_template("login.html")
    

# @app.route("/api/filter")
# def filterlocation():

#     # Get the user selected level
#     # connector_level = request.form("level_select")
#     # connector_type = request.form("type_select")
#     # Filter the database with the selected level
#     # data = mongo.db.stations.find({"$and" :[{"Connections.LevelID" : connector_level}, {"Connections.ConnectionType.Title" : connector_type}]})
    
#     print(f'sssss: {connector_level}')
#     jsondata = dumps(data) # serialization/convert to json object
#     print(type(jsondata))
#     return jsondata


    
if __name__ == "__main__":
    app.run(debug=True)
