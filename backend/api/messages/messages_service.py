from common.utils import safe_get_env_var
import requests
from api.messages.message import Message

import logging

logger = logging.getLogger("myapp")

auth0_domain = safe_get_env_var("AUTH0_DOMAIN")
auth0_client = safe_get_env_var("AUTH0_USER_MGMT_CLIENT_ID")
auth0_secret = safe_get_env_var("AUTH0_USER_MGMT_SECRET")


def get_public_message():
    logger.debug("Public")
    return Message(
        "aaThis is a public message."
    )


def get_protected_message():
    logger.debug("Protected")

    return Message(
        "This is a protected message."
    )


def get_admin_message():
    logger.debug("Admin")

    return Message(
        "This is an admin message."
    )


def get_token():
    logger.debug("Token")

    url = f"https://{auth0_domain}/oauth/token"
    myobj = {
        "client_id": auth0_client,
        "client_secret": auth0_secret,
        "grant_type": "client_credentials",
        "audience": f"https://{auth0_domain}/api/v2/"
    }
    x = requests.post(url, data=myobj)
    x_j = x.json()
    logger.info("Got access token")
    return x_j["access_token"]


import firebase_admin
from firebase_admin import credentials, firestore

cred = credentials.Certificate("/Users/gregv/Downloads/ohack-dev-firebase-adminsdk-hrr2l-933367ee29.json")
firebase_admin.initialize_app(cred)


def save(user_id=None, email=None, last_login=None):
    print("Save Start")
    # https://towardsdatascience.com/nosql-on-the-cloud-with-python-55a1383752fc

    if user_id is None or email is None or last_login is None:
        logger.error(f"Empty values provided for user_id: {user_id}, email: {email}, or last_login: {last_login}")
        return

    db = firestore.client()  # this connects to our Firestore database
    collection = db.collection('users')
    doc = collection.document(user_id)
    res = doc.get().to_dict()
    if res is None:
        insert_res = collection.document(user_id).set({
            "email_address": email,
            "last_login": last_login,
            "user_id": user_id,
            "badges":[
                "first_hackathon"
            ]
        })


        logger.debug(f"Insert Result: {insert_res}")
    else:
        # Found result already in DB, update
        update_res = collection.document(user_id).update({
            "last_login": last_login
        })
        logger.debug(f"Update Result: {update_res}")

    print(res)
    print("Save End")


def get_history(user_id):
    logger.debug("Get Hackathons Start")
    db = firestore.client()  # this connects to our Firestore database
    collection = db.collection('users')
    doc = collection.document(user_id)
    doc_get = doc.get()
    res = doc_get.to_dict()
    logger.debug(res)

    _problem_statements=[]
    for h in res["problem_statements"]:
        _problem_statements.append(h.get().to_dict())

    _hackathons=[]
    for h in res["hackathons"]:
        rec = h.get().to_dict()
        nonprofits = []
        problem_statements = []

        for n in rec["nonprofits"]:
            npo_r = n.get().to_dict()
            # This is duplicate date as we should already have this
            del npo_r["problem_statements"]
            nonprofits.append(npo_r)
        for ps in rec["problem_statements"]:
            problem_statements.append(ps.get().to_dict())



        _hackathons.append({
            "nonprofits": nonprofits,
            "problem_statements": problem_statements,
            "devpost_url": rec["devpost_url"],
            "location": rec["location"],
            "start_date": rec["start_date"]
        })




    _badges=[]
    for h in res["badges"]:
        _badges.append(h.get().to_dict())

    result = {
        "user_id": res["user_id"],
        "email_address" : res["email_address"],
        "badges" : _badges,
        "hackathons" : _hackathons,
        "problem_statements" : _problem_statements
    }

    logger.debug(f"RESULT\n{result}")
    return result




def get_profile_metadata(user_id):
    logger.debug("Profile Metadata")

    token = get_token()
    url = f"https://{auth0_domain}/api/v2/users/{user_id}"
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    x = requests.get(url, headers=headers)
    x_j = x.json()

    logger.debug(x_j)

    email = x_j["email"]
    user_id = x_j["user_id"]
    last_login = x_j["last_login"]
    logger.debug(f"Auth0 Account Details:\nEmail: {email}\nUser ID: {user_id}\nLast Login:{last_login}")

    # Call firebase to see if account exists and save these details
    save(user_id=user_id, email=email, last_login=last_login)

    #response = f"{x_j}"
    response = get_history(user_id)
    logger.debug(response)


    return Message(response)
