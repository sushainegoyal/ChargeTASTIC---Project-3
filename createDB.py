import pymongo
import requests
from config import opendatapi
import sys

# Distributed under the MIT license - http://opensource.org/licenses/MIT

__author__ = 'mLab'

# Set the mongodb URL
mongoURI = "mongodb://heroku_p85w0z3s:1hj6d4lipj3bbqn5p8j6lu30vc@ds311538.mlab.com:11538/heroku_p85w0z3s?retryWrites=false"
#mongoURI = "mongodb://localhost:27017/evcharging"

# Store the API url
opendataURL = "https://api.openchargemap.io/v3/poi/?output=json&countrycode=CA&maxresults=100000&includecomments=true&verbose=true&opendata=true&client=ev-charging-stations&key=opendatapi"

# Get resutls in json format
response = requests.get(opendataURL).json()

def main(args):

    # Connect to mongodb server
    client = pymongo.MongoClient(mongoURI)

    # Get the default database heroku give us
    db = client.get_default_database()

    # Create a collection under the default database for storing all the stations
    opendataCollection = db["OpenData"]

    # Create a new collection for user added stations
    new = db["newStations"]

    # Clean up the database before updating new data
    opendataCollection.delete_many({})

    # Insert new data into the opendataCollection/ build the table
    opendataCollection.insert_many(response)

    # Clocse the connection
    client.close()


if __name__ == '__main__':
    # create a if statement for database update, if the api doesn't exist, it will keep the latest version it has currently
    if response:
        main(sys.argv[1:])
    else:
        pass
