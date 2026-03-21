---
title: Flare-VM
description: This page documents everything there is to know about my homelab
icon: simple/virtualbox
# status: new # deprecated
comments: true
# hide:
#     - navigation
#     - toc
---

FLARE-VM is a Windows-based security distribution specifically designed for malware analysis, incident response, and digital forensics. Developed by the FireEye Labs Advanced Reverse Engineering (FLARE) team, this customizable environment provides a comprehensive collection of open-source and freeware tools pre-configured for security professionals. Unlike traditional Linux security distributions, FLARE-VM runs directly on Windows, offering native analysis capabilities for Windows malware and artifacts while integrating seamlessly with the Windows operating system through a package management system built on Chocolatey.

## Requirements

FLARE-VM should ONLY be installed on a virtual machine. The VM should satisfy the following requirements:

- Windows ≥ 10
- PowerShell ≥ 5
- Disk capacity of at least 60 GB and memory of at least 2GB
- Usernames without spaces or other special characters
- Internet connection
- Tamper Protection and any Anti-Malware solution (e.g., Windows Defender) disabled, preferably via Group Policy
- Windows Updates Disabled

## Installation 

### Pre-installation



- Prepare a Windows 10+ virtual machine
    - Install Windows in the virtual machine, for example using the raw Windows 10 ISO from [https://www.microsoft.com/en-us/software-download/windows10ISO](https://www.microsoft.com/en-us/software-download/windows10ISO)
    - Ensure the [requirements above](https://github.com/mandiant/flare-vm#requirements) are satisfied, including:
        - Disable Windows Updates (at least until installation is finished)
            - [https://www.windowscentral.com/how-stop-updates-installing-automatically-windows-10](https://www.windowscentral.com/how-stop-updates-installing-automatically-windows-10)
        - Disable Tamper Protection and any Anti-Malware solution (e.g., Windows Defender), preferably via Group Policy.
            - GPO: [https://stackoverflow.com/questions/62174426/how-to-permanently-disable-windows-defender-real-time-protection-with-gpo](https://superuser.com/a/1757341)
            - Non-GPO - Manual: [https://www.maketecheasier.com/permanently-disable-windows-defender-windows-10/](https://www.maketecheasier.com/permanently-disable-windows-defender-windows-10)
            - Non-GPO - Automated: [https://github.com/ionuttbara/windows-defender-remover](https://github.com/ionuttbara/windows-defender-remover)
            - Non-GPO - Semi-Automated (User needs to toggle off Tamper Protection): [https://github.com/AveYo/LeanAndMean/blob/main/ToggleDefender.ps1](https://github.com/AveYo/LeanAndMean/blob/main/ToggleDefender.ps1)
- Take a VM snapshot so you can always revert to a state before the FLARE-VM installation
- NOTE for IDA Pro: If you are installing IDA Pro via `idapro.vm`, you must place your IDA Pro installer (and optionally, your license file) on the Desktop before running the FLARE-VM installer.


#### Disable automatic updates 

##### Settings

If you want to prevent the system from downloading a specific update for a short period of time, you do not need to disable Windows Update permanently. Instead, you could pause updates for up to seven days.

To disable automatic updates temporarily, use these steps:

1. Open **Settings**.
2. Click on **Windows Update**.
3. Click the **"Pause updates for 5 Weeks"** option.

    ![image](https://gist.github.com/user-attachments/assets/a65c4d14-a561-4a88-9290-29de5a441a78)
    ![image](https://gist.github.com/user-attachments/assets/191e191e-8e42-47a9-8e11-51fb0b51ba65)

Once you complete the steps, the system won't download for one week. 

??? note

    When it reaches the pause limit, you will need to install the latest patch to make the option available again.

##### Group Policy

On Windows 11, the Local Group Policy Editor includes policies to permanently disable automatic updates or change the update settings to choose when patches should be installed on the device.

To disable automatic updates on Windows 10 permanently, use these steps:

1. Open **Start**.
2. Search for **gpedit.msc** and click the top result to launch the **Local Group Policy Editor**.
3. Navigate to the following path: _**Computer Configuration > Administrative Templates > Windows Components > Windows Update > Manage end user experience**_
4. Double-click the **"Configure Automatic Updates"** policy on the right side.

    ![image](https://gist.github.com/user-attachments/assets/4ee01204-6fc7-4739-96db-2916858a8338)

5. Check the **Disabled** option to turn off automatic Windows 11 updates permanently.
6. Click the Apply button.
7. Click the OK button.

    ![image](https://gist.github.com/user-attachments/assets/0c7dc3e5-46a6-4e76-8e9f-8a5b42c6f84c)

After you complete the steps, Windows 11 will stop downloading updates automatically. 

??? tip
    However, the ability to check for updates manually will continue on **Settings > Windows Update**, and clicking the "**Check for updates**" button to download the most recent patches as needed.

??? note
    If you want to enable automatic updates on the computer again, you can use the same instructions outlined above, but in step 5, make sure to select the "Not Configured" option.

##### Registry

You can also use the Registry in two different ways to disable automatic updates on Windows 10.


??? danger
    This is a friendly reminder that editing the Registry is risky and can cause irreversible damage to your installation if you don't do it correctly. Before proceeding, it's recommended to make a [backup](https://www.windowscentral.com/tag/backup) of your PC.


To disable Windows 11 updates permanently by changing the Registry settings, use these steps:

1. Open **Start**.
2. Search for **regedit** and click the top result to launch the Registry Editor.
3. Navigate to the following path: _**HKEY_LOCAL_MACHINE\SOFTWARE\Policies\Microsoft\Windows**_
4. Right-click the **Windows** (folder) key, select the **New** submenu, and choose the **Key** option.
5. Name the new key **WindowsUpdate** and press **Enter**.
6. Right-click the newly created key, select the **New** submenu, and choose the **Key** option.
7. Name the new key **AU** and press **Enter**.
8. Right-click the **AU** key, select the **New** submenu, and choose the **DWORD (32-bit) Value** option.
9. Name the new key **NoAutoUpdate** and press **Enter**.
10. Double-click the newly created key and change its value from **0** to **1**.

    ![image](https://gist.github.com/user-attachments/assets/e9302198-c855-4b97-b0d6-2a86acc77ae1)

11. Click the **OK** button.
12. Restart the computer.

After you complete the steps, automatic updates will be permanently disabled on the device. However, you can still download updates by clicking the **"Check for updates"** button on the Windows Update settings page.

If you want to undo the changes, you can use the same instructions outlined above, but on **step 4**, right-click the WindowsUpdate key, select the **"Delete"** option, then reboot the computer to apply the settings.

Resources

- [How to stop automatic updates on Windows 10](https://www.windowscentral.com/how-stop-updates-installing-automatically-windows-10)

#### Disable Tamper Protection and any Anti-Malware solution

##### Settings

Windows gives you an option to turn Microsoft Defender off. But, it’s only temporary. Once it’s been off for a while, or you restart your PC, it’ll come back on. If you just need a temporary solution, this is it.

1. Access it by going to **Start -> Settings -> Privacy & security.**
2. Select **Windows Security** and scroll until you see **Virus & threat protection settings**. Click the **Manage Settings** link.
    ![image](https://gist.github.com/user-attachments/assets/0b911dc4-f125-4415-bb10-e64511d3183e)
    ![image](https://gist.github.com/user-attachments/assets/16f3f82f-550b-4819-92de-42869ca7ab8d)
    ![image](https://gist.github.com/user-attachments/assets/4708dea5-00cf-4ff8-bb29-a90e32057e71)
3. Toggle the various options to **Off**. 

    ![image](https://gist.github.com/user-attachments/assets/1b49c0c7-4da9-4660-9eb4-5f58c9e096ec)
    ![image](https://gist.github.com/user-attachments/assets/c5eff79f-16c2-460b-94bd-40e306e8124b)

??? note
    Turning everything off is just temporary. This is great if you just need to disable Microsoft Defender for a short while, but doesn’t solve the ultimate goal of turning off Windows Defender permanently.
??? tip
    Note: if you’re already using another antivirus instead of Microsoft Defender, you may not see these settings at all – which is a fix in itself and will be detailed below.

##### Local Group Policy

1. Press ++win+r++ to load the Run box, type `gpedit.msc` into the box, and press **OK**.
2. When the Local Group Policy window loads, select **Computer Configuration -> Administrative Templates** on the right.
3. Go to **Windows Components -> Microsoft Defender (Antivirus)**. If you don’t see Microsoft Defender, look for **Windows Defender (Antivirus)**. Scroll down until you see the **Turn off Microsoft Defender** file. For older versions of Windows 10, look for **Turn off Windows Defender**.

    ![image](https://gist.github.com/user-attachments/assets/85564123-e7aa-419f-ba8a-2089f2ae4cb4)

4. Double-click it, and click **Enabled** on the left to turn on the **Turn off Microsoft Defender** policy, which disables Microsoft Defender. If you later change your mind, select **Disabled** instead.

    ![image](https://gist.github.com/user-attachments/assets/2b9e460e-9263-4c5f-a802-eadde98d1716)

##### Registry

1. Open the Run command by pressing ++win+r++ . Type `regedit`, and click **OK**.
2. On the left pane of the Registry Editor, navigate to the following folder:
    ```cmd
    HKEY_LOCAL_MACHINE\SOFTWARE\Policies\Microsoft\Windows Defender
    ```
3. Select the **Windows Defender** folder as shown and right-click on the empty space on the right side of the window, and go to **New -> DWORD (32-bit) Value**.
    ![image](https://gist.github.com/user-attachments/assets/331cc2b1-e406-441e-a9b9-8b238d81a72b)
    Windows will create an untitled DWORD file. Right-click the file, and click **Rename**, then call it **DisableAntiSpyware**. Make sure you enter the name perfectly!
4. Right-click the **DisableAntiSpyware** file, and click **Modify**. To enable the policy that disables Microsoft Defender, set the value data to **1**, and click **OK**. This tells the computer that the policy that was just created should be enabled, and Windows will disable Defender for you. If you want to bring Microsoft Defender back, return to this file, and change the value to **0** to disable the policy and allow Defender to work again.
    
    ![image](https://www.maketecheasier.com/assets/uploads/2017/03/Defender-Permanent-Disable-Set.jpg)
    ![image](https://gist.github.com/user-attachments/assets/2b8b33b9-c1fc-46c5-a989-21b2c8b56cc9)


5. If anything related to Defender is still running, add the following DWORD values in the following folder locations using the same process as above:
    - DisableRealtimeMonitoring – set the value to 1.
    - DisableRoutinelyTakingAction – set the value to 1.
    - DisableAntiVirus – set the value to 1.
    - DisableSpecialRunningModes – set the value to 1.
    - ServiceKeepAlive – set value to 0.
6. You may also need to create three new folders under Windows Defender. Right-click the **Windows Defender** folder, and select **New -> Key**. Add three new Keys: **Signature Updates**, **Real-Time Protection**, and **Spynet**.
7. Add the following DWORD values to the corresponding folders:

    ![image](https://gist.github.com/user-attachments/assets/2b8b33b9-c1fc-46c5-a989-21b2c8b56cc9)


    ```cmd
    HKEY_LOCAL_MACHINE\SOFTWARE\Policies\Microsoft\Windows Defender\Signature Updates
    ```

    - ForceUpdateFromMU – set value to 0.

        ![image](https://gist.github.com/user-attachments/assets/bc645f14-edb0-4a54-8f01-2831315bcc96)

    ```cmd
    HKEY_LOCAL_MACHINE\SOFTWARE\Policies\Microsoft\Windows Defender\Real-Time Protection
    ```

    - DisableRealtimeMonitoring – set value to 1.
    - DisableOnAccessProtection – set value to 1.
    - DisableBehaviorMonitoring – set value to 1.
    - DisableScanOnRealtimeEnable – set value to 1.

        ![image](https://gist.github.com/user-attachments/assets/e68f0d30-9452-49ed-af72-8d676f0a6509)


    ```cmd
    HKEY_LOCAL_MACHINE\SOFTWARE\Policies\Microsoft\Windows Defender\Spynet
    ```

    - DisableBlockAtFirstSeen – set value to 1.

        ![image](https://gist.github.com/user-attachments/assets/efbb8925-c4f4-4f4c-84fa-e4500c00e31d)


### Reference

- [How to Permanently Disable Microsoft Defender](https://www.maketecheasier.com/permanently-disable-windows-defender-windows-10/)
- [How to permanently disable Windows Defender Real Time Protection with GPO?](https://superuser.com/questions/1757339/how-to-permanently-disable-windows-defender-real-time-protection-with-gpo/1757341#1757341)


### FLARE-VM installation

[Documentation](https://github.com/mandiant/flare-vm#flare-vm-installation)

1. Open a `PowerShell` prompt as administrator
2. Download the installation script [`installer.ps1`](https://raw.githubusercontent.com/mandiant/flare-vm/main/install.ps1) to your Desktop:
    ```powershell
    (New-Object net.webclient).DownloadFile('https://raw.githubusercontent.com/mandiant/flare-vm/main/install.ps1',"$([Environment]::GetFolderPath("Desktop"))\install.ps1")
    ```
3. Unblock the installation script:
    ```powershell
    Unblock-File .\install.ps1
    ```
4. Enable script execution:
    ```powershell
    Set-ExecutionPolicy Unrestricted -Force
    ```
    
    ??? tip
        If you receive an error saying the execution policy is overridden by a policy defined at a more specific scope, you may need to pass a scope in via `Set-ExecutionPolicy Unrestricted -Scope CurrentUser -Force`. To view execution policies for all scopes, execute `Get-ExecutionPolicy -List`

5. Finally, execute the installer script as follow:
    ```powershell
    # To pass your password as an argument
    .\install.ps1 -password <password>

    # To use the CLI-only mode with minimal user interaction
    .\install.ps1 -password <password> -noWait -noGui

    # To use the CLI-only mode with minimal user interaction and a custom config file
    .\install.ps1 -customConfig <config.xml> -password <password> -noWait -noGui
    ```


??? note

    After installation it is recommended to switch to `host-only` networking mode and take a VM snapshot


#### Installer GUI

The Installer GUI is display after executing the validation checks and installing Boxstarter and Chocolatey (if they are not installed already). Using the installer GUI you may customize:

- Package selection from FLARE-VM and Chocolatey community
- Environment variable paths

![image](https://gist.github.com/user-attachments/assets/c9e7784a-8e4b-4e3a-9cc6-fb04bde6a973)
![image](https://gist.github.com/user-attachments/assets/5d99088c-0a60-4a19-a3b8-a67bc41fa424)
![image](https://gist.github.com/user-attachments/assets/846f7005-9788-48a6-87f8-cbb2a896b007)

----------------

In newer versions of Windows, Group Policy settings for Microsoft Defender are reverted back.  
To prevent this, _before_ changing them:

1. Open Resource Monitor (type `resmon.exe` in the search box)
2. Overview
3. Find `MsMpEng.exe` in the list
4. Right-click > Suspend Process



In Windows 10 1903, Tamper Protection was added.  
Tamper Protection must be disabled _before_ changing Group Policy settings, otherwise these are ignored.

1. Open Windows Security (type `Windows Security` in the search box)
2. Virus & threat protection > Virus & threat protection settings > Manage settings
3. Switch `Tamper Protection` to `Off`


To permanently disable real-time protection:

1. Open Local Group Policy Editor (type `gpedit.msc` in the search box)
2. Computer Configuration > Administrative Templates > Windows Components > Microsoft Defender Antivirus > Real-time Protection
3. Enable `Turn off real-time protection`
4. Restart the computer



To permanently disable Microsoft Defender:

1. Open Local Group Policy Editor (type `gpedit.msc` in the search box)
2. Computer Configuration > Administrative Templates > Windows Components > Microsoft Defender Antivirus
3. Enable `Turn off Microsoft Defender Antivirus`
4. Restart the computer


------------

![image](https://gist.github.com/user-attachments/assets/85564123-e7aa-419f-ba8a-2089f2ae4cb4)

![image](https://gist.github.com/user-attachments/assets/2b9e460e-9263-4c5f-a802-eadde98d1716)



??? example "Installation Log"

```bash

```

