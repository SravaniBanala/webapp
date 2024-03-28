sleep 30

 

sudo apt-get update

sudo apt-get install -y unzip curl

curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -

sudo apt-get install -y nodejs

node -v

npm -v
 
sudo lsb_release -a
 
sudo useradd -m -p $(openssl passwd -1 password) webappuser
 
sudo cat /etc/passwd

sudo wget https://amazoncloudwatch-agent.s3.amazonaws.com/debian/amd64/latest/amazon-cloudwatch-agent.deb
 
echo "downloaded cloud watch"
 
sudo dpkg -i -E ./amazon-cloudwatch-agent.deb
 
echo "unpacked cloudwatch"
 
sudo mv /tmp/amazon-cloudwatch-agent.json /opt/amazon-cloudwatch-agent.json
 
sudo pwd
 
echo "below are current repo folders"
 
sudo ls -ltrh
 
sudo mkdir /home/webappuser/webapp
 
sudo cp /home/admin/webapp.zip /home/webappuser/webapp/
 
ls -ltrah /home/webappuser/webapp/
 
cd /home/webappuser/webapp
 
 
ls -ltrah
 
pwd
 
sudo unzip /home/webappuser/webapp/webapp.zip
 
sudo ls -ltrah /home/webappuser/webapp
 
sudo npm ci
 
sudo npm install --save
 
sudo npm fund
 
ls -ltrah
 
 
cd /home/admin/
 
sudo chmod -R 744 /home/webappuser/
 
sudo chown -R webappuser:webappuser /home/webappuser/webapp
 
sudo ls -ltrah /home/webappuser/
 
sudo mv /tmp/webapp.service /etc/systemd/system/webapp.service
sudo systemctl daemon-reload
 
sudo systemctl enable webapp
 
sudo systemctl start webapp
 
sudo echo $?
 
sleep 20
 
sudo systemctl status webapp
 
sudo echo $?