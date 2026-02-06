total kibana - 34797
before cleaning up - 38367

-- there's some problem with the date setted to make the requests
i inserted the whole january month and got the q = https://billing-services-qas.bluelab.com.br/billing-service/v1/companies/6058d2416a32d4dc2c2d29e6/instances/6911361be23c596e66834f56/analytics?from=2025-12-31T23%3A00%3A00.000Z&to=2026-01-31T23%3A01%3A00.000Z

----------------

POST PROCESSING
-> maybe having a entity extractor with nlp for getting phone numbers and email
- PHONE: [06 6646 4094](tel:+390666464094)
- EMAIL: [Email text for user](mailto:email@example.com?subject=Subject&body=Text)

--

RECONNECTION
- make the session alive across pages


processor.event:"transaction" AND transaction.id:"1a84b4e624595a12" AND trace.id:"000000000000000004b167f314904046"
